import { useEffect, useState } from 'react';
import { Modal, Select, Input, Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { useAppContext } from '@/context/appContext';
import { selectDeletedItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';
import useLanguage from '@/locale/useLanguage';

const { TextArea } = Input;

export default function OrganizationDeleteModal({ config }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { state, crudContextAction } = useCrudContext();
  const { appContextAction } = useAppContext();
  const { panel, readBox, modal } = crudContextAction;
  const { navMenu } = appContextAction;

  const { isModalOpen } = state;

  // Only activate for organization; otherwise do nothing and let common modal be used.
  if (config.entity !== 'organization') {
    return null;
  }

  // Local 2-step state
  const [step, setStep] = useState(1);
  const [displayItem, setDisplayItem] = useState('');
  const [reason, setReason] = useState();
  const [remarks, setRemarks] = useState('');

  const deleteReasons = [
    { value: 'duplicate_entry', label: 'Duplicate Entry' },
    { value: 'school_dropped', label: 'School Dropped' },
    { value: 'school_inactive', label: 'School Inactive' },
    { value: 'school_did_not_want_to_continue_with_mad', label: 'School did not want to continue with MAD' }  
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

  // Success → close + reset
  useEffect(() => {
    if (isSuccess && isModalOpen) {
      modal.close();
      dispatch(crud.list({ entity: config.entity }));
      resetLocalState();
    }
  }, [isSuccess, isModalOpen, config.entity, dispatch, modal]);

  // Modal closed externally → reset
  useEffect(() => {
    if (!isModalOpen) {
      resetLocalState();
    }
  }, [isModalOpen]);

  const resetLocalState = () => {
    setStep(1);
    setReason(undefined);
    setDisplayItem('');
  };

  // Step 1 → validate + go to Step 2
  const handleProceed = () => {
    if (!reason) {
      // swap with antd message.error if you prefer
      alert('Please select a reason before proceeding.');
      return;
    }
    setStep(2);
  };

  // Step 2 → actual delete
  const handleConfirmDelete = () => {
    if (!current?.id) return;

    // Adapt this to your backend: send reason/remarks in body
    dispatch(
      crud.delete({
        entity: config.entity,
        id: current.id,
        data: {
          delete_reason: reason
        },
      })
    );

    readBox.close();
    panel.close();
    navMenu.collapse();
    // Modal closes on isSuccess
  };

  const handleCancel = () => {
    if (!isLoading) {
      modal.close();
      resetLocalState();
    }
  };

  if (!isModalOpen || config.entity !== 'organization') return null;

  const title =
    step === 1
      ? `Delete Organization - ${current?.partner_name || ""}`
      : translate('delete_confirmation') || 'Delete Confirmation';

  const okText =
    step === 1
      ? translate('proceed') || 'Proceed'
      : translate('confirm_delete') || 'Confirm Delete';

  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={step === 1 ? handleProceed : handleConfirmDelete}
      onCancel={handleCancel}
      okText={okText}
      cancelText={translate('cancel') || 'Cancel'}
      confirmLoading={isLoading}
      destroyOnClose
    >
      {step === 1 ? (
        <>
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
        </>
      ) : (
        <p>
          Are you sure you want to delete{' '}
          <strong>{displayItem || current?.partner_name || ''}</strong>?
          <br />
          <br />
          <strong>Reason:</strong>{' '}
          {deleteReasons.find((r) => r.value === reason)?.label || reason}
          <br/>
          <br/>
          This will also auto-delete all data from Session Ops tool.
        </p>
      )}
    </Modal>
  );
}
