import { useState, useEffect } from 'react';
import { Form, DatePicker, InputNumber, Upload, Button, message, Typography, Card, Select, Modal } from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import { crud } from '@/redux/crud/actions';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import Loading from '@/components/Loading';

const { Text, Title } = Typography;

export default function MouRenewalForm() {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { crudContextAction, state } = useCrudContext();
  const { panel, collapsedBox, advancedBox } = crudContextAction;
  const { isPanelClose } = state;
  const { result: currentItem } = useSelector(selectCurrentItem);

  // Step: 'ask_renewed' | 'renewal_form' | 'ask_discontinue'
  const [step, setStep] = useState('ask_renewed');
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [discontinueReason, setDiscontinueReason] = useState(null);
  const [form] = Form.useForm();

  // Watch all form fields for submit button disabled state
  const mouSignDate = Form.useWatch('mou_sign_date', form);
  const mouStartDate = Form.useWatch('mou_start_date', form);
  const mouEndDate = Form.useWatch('mou_end_date', form);
  const confirmedChildCount = Form.useWatch('confirmed_child_count', form);
  const mouDocument = Form.useWatch('mou_document', form);

  const isFormComplete =
    mouSignDate && mouStartDate && mouEndDate && confirmedChildCount > 0 && mouDocument?.length > 0;

  // Reset form when side panel closes
  useEffect(() => {
    if (isPanelClose) {
      setStep('ask_renewed');
      setFileList([]);
      setDiscontinueReason(null);
      form.resetFields();
    }
  }, [isPanelClose, form]);

  const resetAndClose = () => {
    setStep('ask_renewed');
    setFileList([]);
    setDiscontinueReason(null);
    form.resetFields();
    advancedBox.close();
    panel.close();
    collapsedBox.close();
  };

  // Refresh the active partners list after any review action
  const refreshActiveList = () => {
    dispatch(crud.list({ entity: 'organization', options: { status: 'active' } }));
  };

  // --- Step: ask_renewed ---
  const handleRenewedYes = () => {
    setStep('renewal_form');
  };

  const handleRenewedNo = () => {
    setStep('ask_discontinue');
  };

  // --- Step: ask_discontinue ---
  const performDiscontinue = async () => {
    setLoading(true);
    try {
      const response = await request.delete({
        entity: 'organization',
        id: currentItem.id,
        data: { delete_reason: discontinueReason },
      });
      if (response.success) {
        message.success('Partner relationship has been discontinued.');
        refreshActiveList();
        resetAndClose();
      } else {
        message.error(response.message || 'Failed to discontinue partnership.');
      }
    } catch (error) {
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showDiscontinueConfirm = () => {
    Modal.confirm({
      title: 'Confirm Discontinue Relationship',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            This action <strong>cannot be rolled back</strong>.
          </p>
          <p style={{ marginBottom: 8 }}>
            The partner will be marked as inactive and all associated{' '}
            <strong>session-ops data will be automatically removed</strong>.
          </p>
          <p style={{ color: '#8c8c8c', fontSize: 13 }}>
            Are you sure you want to discontinue the relationship with{' '}
            <strong>{currentItem?.name}</strong>?
          </p>
        </div>
      ),
      okText: 'Yes, Discontinue',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: performDiscontinue,
    });
  };

  const handleDiscontinueNo = () => {
    setStep('ask_renewed');
  };

  // --- Step: renewal_form submit ---
  const performRenewal = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('mou_sign_date', values.mou_sign_date.format('YYYY-MM-DD'));
      formData.append('mou_start_date', values.mou_start_date.format('YYYY-MM-DD'));
      formData.append('mou_end_date', values.mou_end_date.format('YYYY-MM-DD'));
      formData.append('confirmed_child_count', values.confirmed_child_count);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('mou_document', fileList[0].originFileObj);
      }

      const response = await request.post({
        entity: `organization/renew-mou/${currentItem.id}`,
        jsonData: formData,
      });

      if (response.success) {
        message.success('MOU renewed successfully.');
        refreshActiveList();
        resetAndClose();
      } else {
        message.error(response.message || 'Failed to renew MOU.');
      }
    } catch (error) {
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitClick = async () => {
    try {
      const values = await form.validateFields();
      Modal.confirm({
        title: 'Confirm MOU Renewal',
        icon: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />,
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>
              You are about to renew the MOU for <strong>{currentItem?.partner_name}</strong>.
            </p>
            <p style={{ color: '#8c8c8c', fontSize: 13 }}>
              Please make sure all the details are correct before confirming.
            </p>
          </div>
        ),
        okText: 'Yes, Renew MOU',
        cancelText: 'Review Again',
        onOk: () => performRenewal(values),
      });
    } catch {
      // Validation failed — Ant Design shows field errors automatically
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // Keep only the last file
  };

  const beforeUpload = (file) => {
    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
      message.error('You can only upload PDF files.');
      return Upload.LIST_IGNORE;
    }
    const isLt15M = file.size / 1024 / 1024 < 15;
    if (!isLt15M) {
      message.error('File must be smaller than 15MB.');
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  // --- Date validators ---
  const validateStartDate = (_, value) => {
    if (!value) return Promise.resolve();
    const signDate = form.getFieldValue('mou_sign_date');
    if (signDate && value.isBefore(signDate, 'day')) {
      return Promise.reject('Start date cannot be before sign date');
    }
    return Promise.resolve();
  };

  const validateEndDate = (_, value) => {
    if (!value) return Promise.resolve();
    const startDate = form.getFieldValue('mou_start_date');
    const signDate = form.getFieldValue('mou_sign_date');
    if (startDate && (value.isBefore(startDate, 'day') || value.isSame(startDate, 'day'))) {
      return Promise.reject('End date must be after start date');
    }
    if (signDate && (value.isBefore(signDate, 'day') || value.isSame(signDate, 'day'))) {
      return Promise.reject('End date must be after sign date');
    }
    return Promise.resolve();
  };

  // Re-validate dependent fields when a date changes
  const handleDateChange = () => {
    const fields = ['mou_start_date', 'mou_end_date'];
    const touched = fields.filter((f) => form.getFieldValue(f));
    if (touched.length) {
      form.validateFields(touched).catch(() => {});
    }
  };

  // --- Render based on step ---

  if (step === 'ask_renewed') {
    if (currentItem?.mou_review_locked) {
      return (
        <Card
          style={{
            margin: '30px 0',
            borderRadius: 12,
            border: '1px solid #faad14',
            background: '#fffbe6',
          }}
          bodyStyle={{ padding: '30px 20px', textAlign: 'center' }}
        >
          <LockOutlined style={{ fontSize: 36, color: '#faad14', marginBottom: 16 }} />
          <Title level={5} style={{ marginBottom: 8, color: '#333' }}>
            MOU Review Locked
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 13 }}>
            MOU review for this partner has already been completed for the current period.
            It will be available again when the next review cycle is due.
          </Text>
          <Button onClick={resetAndClose}>Close</Button>
        </Card>
      );
    }

    return (
      <Loading isLoading={loading}>
        <Card
          style={{
            margin: '30px 0',
            borderRadius: 12,
            border: '1px solid #1890ff',
            background: '#f0f7ff',
          }}
          bodyStyle={{ padding: '30px 20px', textAlign: 'center' }}
        >
          <CheckCircleOutlined style={{ fontSize: 36, color: '#1890ff', marginBottom: 16 }} />
          <Title level={5} style={{ marginBottom: 24, color: '#333' }}>
            Are you continuing with the school for the next year?
          </Title>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button type="primary" size="large" onClick={handleRenewedYes} style={{ minWidth: 100 }}>
              Yes
            </Button>
            <Button size="large" onClick={handleRenewedNo} style={{ minWidth: 100 }}>
              No
            </Button>
          </div>
        </Card>
      </Loading>
    );
  }

  if (step === 'ask_discontinue') {
    const discontinueReasonOptions = [
      { value: 'school_partner_not_cooperating', label: 'School partner not cooperating' },
      { value: 'low_child_count', label: 'Low child count' },
      { value: 'slot_timing_volunteer_availability_issues', label: 'Slot timing / volunteer availability issues' },
      { value: 'ngo_partnership_discontinued', label: 'NGO partnership discontinued' },
    ];

    return (
      <Loading isLoading={loading}>
        <Card
          style={{
            margin: '30px 0',
            borderRadius: 12,
            border: '1px solid #ff4d4f',
            background: '#fff2f0',
          }}
          bodyStyle={{ padding: '24px 20px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <CloseCircleOutlined style={{ fontSize: 36, color: '#ff4d4f', marginBottom: 12 }} />
            <Title level={5} style={{ marginBottom: 4, color: '#333' }}>
              Are we discontinuing our relation with the school?
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              This will mark the partner as inactive
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
              Reason <Text type="danger">*</Text>
            </Text>
            <Select
              placeholder="Select a reason"
              style={{ width: '100%' }}
              value={discontinueReason}
              onChange={(val) => setDiscontinueReason(val)}
              options={discontinueReasonOptions}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              type="primary"
              danger
              size="large"
              onClick={showDiscontinueConfirm}
              disabled={!discontinueReason}
              style={{ flex: 1 }}
            >
              Confirm Discontinue
            </Button>
            <Button size="large" onClick={handleDiscontinueNo} style={{ flex: 1 }}>
              Go Back
            </Button>
          </div>
        </Card>
      </Loading>
    );
  }

  // step === 'renewal_form'
  return (
    <Loading isLoading={loading}>
      <Form form={form} layout="vertical">
        <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 15 }}>
          Please enter renewal details
        </Text>

        <Form.Item
          label={translate('mou_sign_date')}
          name="mou_sign_date"
          rules={[{ required: true, message: 'Please select MOU sign date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD-MM-YYYY"
            onChange={handleDateChange}
          />
        </Form.Item>

        <Form.Item
          label={translate('mou_start_date')}
          name="mou_start_date"
          dependencies={['mou_sign_date']}
          rules={[
            { required: true, message: 'Please select MOU start date' },
            { validator: validateStartDate },
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD-MM-YYYY"
            onChange={handleDateChange}
          />
        </Form.Item>

        <Form.Item
          label={translate('mou_end_date')}
          name="mou_end_date"
          dependencies={['mou_sign_date', 'mou_start_date']}
          rules={[
            { required: true, message: 'Please select MOU end date' },
            { validator: validateEndDate },
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD-MM-YYYY"
          />
        </Form.Item>

        <Form.Item
          label="Confirmed Child Count as per MOU"
          name="confirmed_child_count"
          rules={[{ required: true, message: 'Please enter confirmed child count' }]}
        >
          <InputNumber
            placeholder="Enter confirmed child count"
            min={1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Upload MOU"
          name="mou_document"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          rules={[{ required: true, message: 'Please upload MOU document' }]}
        >
          <Upload
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            fileList={fileList}
            maxCount={1}
            accept=".pdf"
          >
            {fileList.length === 0 && (
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            )}
          </Upload>
        </Form.Item>

        <Text type="warning" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
          MOU file should be in a pdf format, lesser than 15 MB
        </Text>

        <Form.Item>
          <Button type="primary" block disabled={!isFormComplete} onClick={onSubmitClick}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );
}
