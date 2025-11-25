import { useEffect, useState } from 'react';
import { Modal, Select, Input, Form, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { useAppContext } from '@/context/appContext';
import { selectDeletedItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';
import useLanguage from '@/locale/useLanguage';

export default function OrganizationDeleteModal({ config }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { state, crudContextAction } = useCrudContext();
  const { appContextAction } = useAppContext();
  const { panel, readBox, modal } = crudContextAction;
  const { navMenu } = appContextAction;

  const { isModalOpen } = state;

  if (config.entity !== 'organization') return null;

  // States
  const [step, setStep] = useState(1);
  const [displayItem, setDisplayItem] = useState('');
  const [reason, setReason] = useState();
  const [confirmText, setConfirmText] = useState('');

  const deleteReasons = [
    { value: 'duplicate_entry', label: 'Duplicate Entry' },
    { value: 'school_dropped', label: 'School Dropped' },
    { value: 'school_inactive', label: 'School Inactive' },
    {
      value: 'school_did_not_want_to_continue_with_mad',
      label: 'School did not want to continue with MAD',
    },
  ];

  // Build display label
  useEffect(() => {
    if (current && config.deleteModalLabels?.length) {
      const labels = config.deleteModalLabels
        .map((x) => valueByString(current, x))
        .join(' ');
      setDisplayItem(labels);
    }
  }, [current, config.deleteModalLabels]);

  // Success → close
  useEffect(() => {
    if (isSuccess && isModalOpen) {
      modal.close();
      dispatch(crud.list({ entity: config.entity }));
      resetLocalState();
    }
  }, [isSuccess, isModalOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isModalOpen) resetLocalState();
  }, [isModalOpen]);

  const resetLocalState = () => {
    setStep(1);
    setReason(undefined);
    setDisplayItem('');
    setConfirmText('');
  };

  const handleProceed = () => {
    if (!reason) {
      alert('Please select a reason before proceeding.');
      return;
    }
    setStep(2);
  };

  const handleConfirmDelete = () => {
    if (!current?.id) return;

    dispatch(
      crud.delete({
        entity: config.entity,
        id: current.id,
        data: {
          delete_reason: reason, // only sending reason now
        },
      })
    );

    readBox.close();
    panel.close();
    navMenu.collapse();
  };

  const handleCancel = () => {
    if (!isLoading) {
      modal.close();
      resetLocalState();
    }
  };

  if (!isModalOpen) return null;

  const title =
    step === 1
      ? `Delete Organization - ${current?.partner_name || ''}`
      : translate('delete_confirmation') || 'Delete Confirmation';

  const okText =
    step === 1
      ? translate('proceed') || 'Proceed'
      : translate('confirm_delete') || 'Confirm Delete';

  const okDisabled = step === 2 ? confirmText !== 'DELETE' : false;

  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={step === 1 ? handleProceed : handleConfirmDelete}
      onCancel={handleCancel}
      okText={okText}
      cancelText={translate('cancel') || 'Cancel'}
      confirmLoading={isLoading}
      okButtonProps={{ disabled: okDisabled || isLoading }}
      destroyOnClose
    >
      {step === 1 ? (
        <Form layout="vertical">
          <Form.Item label="Reason for deletion" required>
            <Select
              placeholder="Select reason"
              options={deleteReasons}
              value={reason}
              onChange={setReason}
              allowClear
            />
          </Form.Item>
        </Form>
      ) : (
        <>
          <p>
            Are you sure you want to delete{' '}
            <strong>{displayItem || current?.partner_name || ''}</strong>?
          </p>

          <p>
            <strong>Reason:</strong>{' '}
            {deleteReasons.find((r) => r.value === reason)?.label || reason}
          </p>

          <Form layout="vertical">
            <Form.Item
              label="Type DELETE to confirm:"
              required
              validateStatus={
                confirmText && confirmText !== 'DELETE' ? 'error' : ''
              }
              help={
                confirmText && confirmText !== 'DELETE'
                  ? 'Please type DELETE exactly (uppercase).'
                  : ''
              }
            >
              <Input
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </Form.Item>
          </Form>

          <Alert
            style={{ marginTop: 8 }}
            type="warning"
            showIcon
            message="Session Ops impact"
            description="This will also auto-delete linked data from Session Ops during sync."
          />
        </>
      )}
    </Modal>
  );
}
