import { Form, Input, Select, DatePicker, Radio, Switch, InputNumber, Checkbox } from 'antd';
import { useState, useEffect } from 'react';
import useLanguage from '@/locale/useLanguage';
import dayjs from 'dayjs';
// import CoListSelect from '@/components/CoListComponent/CoListSelect';
import CustomColorSelect from '@/components/SelectBoxComponent/CustomColorSelect';

import { lead_source } from '@/utils/Lead/leadSource';
import { affiliatedSchoolList } from '@/utils/affiliatedSchoolList';
import { schoolTypeList } from '@/utils/schoolTypeList';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import CoListSelect from '../components/CoListComponent/CoListSelect';
import LocationSelect from '../components/SelectBoxComponent/StateSelect';
import Loading from '../components/Loading';

export default function LeadForm({ config, isUpdate = false, form }) {
  // console.log(isUpdate, 'isUpdate');

  const translate = useLanguage();

  const [status, setStatus] = useState('new');
  console.log("set status value :", status)
  const [loading, setLoading] = useState(false);

  const [isMouSigned, setIsMouSigned] = useState(null);
  const [isSpecificDocumentRequired, setIsSpecificDocumentRequired] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [delayedCurrentStatus, setDelayedCurrentStatus] = useState(null);
  const [isInterested, setIsInterested] = useState(null)
  const [isConverted, setIsConverted] = useState(null)
  const [isReady, setIsReady] = useState(false);


  const dispatch = useDispatch();
  const { crudContextAction, state } = useCrudContext();
  const { collapsedBox } = crudContextAction;
  const {isEditBoxOpen} = state;

  const { result: currentItem } = useSelector(selectCurrentItem);
  console.log("lead form is rendered................")
  // console.log("initial current Item value in LeadForm :", currentItem)

  const setFormCoversionStage = (value) => {
    console.log("set conversion stage value from current item :", value)
    if(value == 'new'){
      setStatus('new')
    }

    if(value == 'interested'){
      // currentItem.conversion_stage = 'prospecting';
      console.log("setting tha form conversion stage prospecting")
      setStatus('prospecting')
    }
    
    if(value == 'interested_but_facing_delay'){
      // currentItem.conversion_stage = 'in_conversion'
      currentItem.converted = true
      setStatus('in_conversion');
      setIsConverted(false)
    }
    
    if(value == 'dropped'){
      // currentItem.conversion_stage = 'in_conversion';
      setStatus('in_conversion')
    }
  }

  useEffect(() => {
    if (isUpdate && currentItem) {

    let updatedConversionStage = "new"; // Default stage

    // Map backend conversion_stage to allowed values
    if (currentItem.conversion_stage === "new") {
      updatedConversionStage = "new";
    } else if (
      currentItem.conversion_stage === "interested" ||
      currentItem.conversion_stage === "dropped"
    ) {
      updatedConversionStage = "prospecting";
    } else if (currentItem.conversion_stage === "interested_but_facing_delay") {
      currentItem.conversion_stage == "in_conversion"
      updatedConversionStage = "in_conversion";
    }

      form.setFieldsValue({
        ...currentItem,
        converted: currentItem.conversion_stage == 'interested_but_facing_delay' ? false : null,
        conversion_stage: updatedConversionStage,
        date_of_first_contact: currentItem.date_of_first_contact
          ? dayjs(currentItem.date_of_first_contact)
          : null,
        mou_sign_date: currentItem.mou_sign_date ? dayjs(currentItem.mou_sign_date) : null,
        mou_start_date: currentItem.mou_start_date ? dayjs(currentItem.mou_start_date) : null,
        agreement_drop_date: currentItem.agreement_drop_date
          ? dayjs(currentItem.agreement_drop_date)
          : null,
      });
      console.log("current iteam value in lead form middle of useeffeect) :", currentItem)
      // setFormCoversionStage(currentItem.conversion_stage)
      setStatus(updatedConversionStage);
      setIsConverted(currentItem.converted || null)
      setIsMouSigned(currentItem.mou_sign || null)
      setIsInterested(currentItem.interested)
      setIsSpecificDocumentRequired(currentItem.specific_document_required || null);


      setIsReady(true);
    }
  }, [currentItem, isUpdate, form]);

  // const { result: listResult} =    useSelector(selectListItems);
  // const { pagination, items: dataSource } = listResult;

  // const handelDataTableLoad = useCallback((pagination) => {
  //   const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
  //   dispatch(crud.list({ entity, options }));
  // }, []);

  const [formData, setFormData] = useState({
    co_name: null,
    partner_name: null,
    address: null,
    pincode: null,
    lead_source: null,
    createdDate: null,
    status: null,
  });

  // Utility to update formData state
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [, forceRender] = useState(0);

  // When status changes, also update formData
  const handleStatusChange = (value) => {
    console.log('Status changed to:', value);
    setStatus(value);
    handleFieldChange('status', value);
    form.setFieldValue('lead_status', value);

    // Force a re-render to update the visible fields
    forceRender((prev) => prev + 1);
  };

  // Handle MOU signed status change
  const handleMouChange = (e) => {
    const value = e.target.value;
    setIsMouSigned(value);
    handleFieldChange('mou_signed', value);
  };

  const handleSpecificDocumentRequiredChange = (e) => {
    const value = e.target.value;
    setIsSpecificDocumentRequired(value);
    handleFieldChange('specific_document_required', value);
  };

  const handleFileChange = (fileList) => {
    setFileList(fileList);
  };

  const handleDelayedCurrentStatusChange = (value) => {
    setDelayedCurrentStatus(value);
    console.log("handled delayed current status :", value)
    // setStatus(value);
    handleFieldChange('current_status', value);
  };

  const handleInterestedChange = (e) => {
    const value = e.target.value
    setIsInterested(value)
    console.log("handle interested change function value changed :", value)
  }

  const handleConvertedChange = (e) => {
    const value = e.target.value
    setIsConverted(value)
    console.log('handle converted value change function value changed :', value);
  }

  const setConversionStage = (dataToSend) => {
    if(dataToSend.conversion_stage == 'new' ){
      return 'new';
    }

    if (dataToSend.conversion_stage === 'prospecting') {
      return dataToSend.interested == true ? 'interested' : 'dropped';
    }

    if (dataToSend.conversion_stage === 'in_conversion') {
      if (dataToSend.interested == true && dataToSend.converted == true) {
        return 'converted';
      }
      if (dataToSend.interested == true && dataToSend.converted == false) {
        return 'interested_but_facing_delay';
      }
      return 'dropped'; 
    }
  }

  const handleSubmit = async(values) => {
    console.log('Form submitted with values:', values);
    console.log('current item details in Lead form :', currentItem);

    let dataToSend = { ...values };
    const conversion_stage = setConversionStage(dataToSend)  
    dataToSend.conversion_stage = conversion_stage;

    if(dataToSend.conversion_stage == 'converted'){
      dataToSend.mou_sign = true
    }

    console.log('data to send in lead form :', dataToSend);

    setLoading(true);

    try {
      if (isUpdate) {
       await dispatch(
          crud.update({
            entity: 'lead',
            id: currentItem.id,
            jsonData: dataToSend,
            withUpload: true,
          })
        );
        crudContextAction.panel.close();
        crudContextAction.editBox.close();
        
      } else {
        await dispatch(crud.create({ entity: 'lead', jsonData: dataToSend }));
        crudContextAction.panel.close();
      }
      dispatch(crud.list({ entity: 'lead' }));
    } catch (error) {
      message.error(translate(isUpdate ? 'error_updating_user' : 'error_creating_user'));
    } finally {
      setLoading(false);
    }
  };

  const stagesOrder = [
    'new',
    'prospecting',
    'in_conversion'
  ];

  const isStageVisible = (stage) => {
    const currentStatus = status;
    const currentIndex = stagesOrder.indexOf(currentStatus);
    const stageIndex = stagesOrder.indexOf(stage);

    // console.log('Checking visibility:', {
    //   stage,
    //   currentStatus,
    //   currentIndex,
    //   stageIndex,
    //   isVisible: stageIndex <= currentIndex,
    // });

    return stageIndex <= currentIndex;
  };

  if (isUpdate) {
    if(!isReady){
      console.log("its update function and not ready")
      return <Loading />; // Show a loader until data is set
    }
  }


  return (
    <Loading isLoading={loading}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Status */}
        <Form.Item
          label={translate('conversion_stage')}
          name="conversion_stage"
          rules={[{ required: true }]}
        >
          <Select
            onChange={(value) => {
              handleStatusChange(value);
              form.setFieldValue('lead_status', value);
            }}
            options={[
              { label: translate('new'), value: 'new' },
              { label: translate('prospecting'), value: 'prospecting', disabled: !isEditBoxOpen },
              {
                label: translate('in_conversion'),
                value: 'in_conversion',
                disabled: !isEditBoxOpen,
              },
            ]}
          />
        </Form.Item>

        <CoListSelect name="co_id" label="CO" required />

        <Form.Item
          label={translate('partner_name')}
          name="partner_name"
          rules={[{ required: true, message: translate('please_enter_name') }]}
        >
          <Input onChange={(e) => handleFieldChange('partner_name', e.target.value)} />
        </Form.Item>

        {/* <CountrySelect name="country" label="country" required /> */}

        <LocationSelect
          nameState="state_id"
          nameCity="city_id"
          labelState="state"
          labelCity="city"
          required={true}
        />

        <Form.Item
          label={translate('address_line_1')}
          name="address_line_1"
          rules={[{ required: true, message: translate('please_enter_address') }]}
        >
          <Input onChange={(e) => handleFieldChange('address', e.target.value)} />
        </Form.Item>

        <Form.Item label={translate('address_line_2')} name="address_line_2">
          <Input onChange={(e) => handleFieldChange('address', e.target.value)} />
        </Form.Item>

        <Form.Item
          label={translate('pincode')}
          name="pincode"
          rules={[
            { required: true, message: translate('please_enter_pincode') },
            { pattern: /^[1-9][0-9]{5}$/, message: translate('pincode_must_be_6_digits') },
          ]}
        >
          <Input
            type="text"
            maxLength={6}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
              if (value.length > 6) {
                value = value.slice(0, 6); // Trim extra digits
              }
              handleFieldChange('pincode', value);
            }}
          />
        </Form.Item>

        <CustomColorSelect name="lead_source" label="lead_source" required options={lead_source} />

        {isStageVisible('prospecting') && (
          <>
            <Form.Item
              label={translate('date_of_first_contact')}
              name="date_of_first_contact"
              rules={[
                {
                  required: status === 'prospecting' || status === 'in_conversion',
                  message: translate('please_enter_date_of_first_conversation'),
                },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                onChange={(date) =>
                  handleFieldChange(
                    'date_of_first_conversation',
                    date ? dayjs(date).format('YYYY-MM-DD') : null
                  )
                }
              />
            </Form.Item>

            <Form.Item label={translate('Point_of_Contact_(POC)_Name')} name="poc_name" required>
              <Input onChange={(e) => handleFieldChange('poc_name', e.target.value)} />
            </Form.Item>

            <Form.Item label={translate('POC_Designation')} name="poc_designation" required>
              <Input onChange={(e) => handleFieldChange('poc_designation', e.target.value)} />
            </Form.Item>

            <Form.Item
              label={translate('POC_Contact')}
              name="poc_contact"
              rules={[
                { required: true, message: translate('Please enter contact number') },
                {
                  pattern: /^[6789]\d{9}$/, // Starts with 6,7,8,9 and exactly 10 digits
                  message: translate('Invalid contact number'),
                },
              ]}
            >
              <Input
                placeholder="+91 1234567890"
                maxLength={10}
                onChange={(e) => handleFieldChange('poc_contact', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={translate('POC_Email')}
              name="poc_email"
              rules={[
                { required: true, message: translate('Please enter email') },
                { type: 'email', message: translate('Invalid email address') },
              ]}
            >
              <Input onChange={(e) => handleFieldChange('poc_email', e.target.value)} />
            </Form.Item>

            <Form.Item
              label={translate('partner_affiliation_type')}
              name="partner_affiliation_type"
              rules={[
                {
                  required: status === 'prospecting' || status === 'in_conversion',
                  message: translate('please_select_partner_affiliation_type'),
                },
              ]}
            >
              <Select
                options={affiliatedSchoolList}
                onChange={(value) => handleFieldChange('affiliated_school', value)}
              />
            </Form.Item>

            <Form.Item label={translate('school_type')} name="school_type" required>
              <Select
                options={schoolTypeList}
                onChange={(value) => handleFieldChange('type_of_school', value)}
              />
            </Form.Item>

            <Form.Item
              label={translate('total_child_count')}
              name="total_child_count"
              rules={[
                {
                  required: status === 'prospecting' || status === 'in_conversion',
                  message: translate('please_enter_total_child_count'),
                },
              ]}
            >
              <Input onChange={(value) => handleFieldChange('potential_no_of_children', value)} />
            </Form.Item>

            <Form.Item
              label={translate('potential_child_count')}
              name="potential_child_count"
              rules={[
                {
                  required: status === 'prospecting' || status === 'in_conversion',
                  message: translate('please_enter_potential_child_count'),
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve(); // Skip validation if empty (handled by `required`)
                    const number = Number(value);
                    if (isNaN(number) || number < 40 || number > 60) {
                      return Promise.reject(translate('value_must_be_between_40_and_60'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                onChange={(e) => handleFieldChange('potential_no_of_children', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={translate('select_classes')}
              name="classes"
              rules={[
                {
                  required: true,
                  message: translate('please_select_at_least_one_classes'),
                },
                {
                  validator: (_, value) =>
                    value && value.length >= 1
                      ? Promise.resolve()
                      : Promise.reject(translate('please_select_at_least_one_classes')),
                },
              ]}
            >
              <Checkbox.Group
                onChange={(checkedValues) => handleFieldChange('selected_classes', checkedValues)}
              >
                <Checkbox value="5th">5th</Checkbox>
                <Checkbox value="6th">6th</Checkbox>
                <Checkbox value="7th">7th</Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              label={translate('low_income_resource')}
              name="low_income_resource"
              valuePropName="checked"
              rules={[
                {
                  required: status === 'prospecting' || status === 'in_conversion',
                },
              ]}
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item
              label={translate('interested')}
              name="interested"
              rules={[
                {
                  required: status === 'prospecting' || status === 'in_conversion',
                },
              ]}
            >
              <Radio.Group onChange={handleInterestedChange}>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}

        {isInterested === false && (
          <>
            <Form.Item
              label={translate('non_conversion_reason')}
              name="non_conversion_reason"
              rules={[
                { required: true, message: translate('please_select_reason_for_non_conversion') },
              ]}
            >
              <Select
                onChange={(value) => handleFieldChange('reason_for_non_conversion', value)}
                options={[
                  { label: 'MoU content issues', value: 'MoU_content_issues' },
                  {
                    label: 'Needs permission from management',
                    value: 'needs_permission_from_management',
                  },
                  { label: "Class timings didn't work", value: 'class_timings_didnt_work' },
                  { label: 'Lack of space for classes', value: 'lack_of_space_for_classes' },
                  { label: 'No permission from parents', value: 'no_permission_from_parents' },
                  { label: 'Other', value: 'other' },
                ]}
              />
            </Form.Item>

            <Form.Item label={translate('if_any_other_reason')} name="if_any_other_reason">
              <Input onChange={(e) => handleFieldChange('if_any_other_reason', e.target.value)} />
            </Form.Item>

            <Form.Item
              label={translate('agreement_drop_date')}
              name="agreement_drop_date"
              rules={[{ required: true, message: translate('please_select_date_of_closing_lead') }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                onChange={(date) =>
                  handleFieldChange(
                    'date_of_closing_lead',
                    date ? dayjs(date).format('YYYY-MM-DD') : null
                  )
                }
              />
            </Form.Item>
          </>
        )}

        {isInterested === true && status === 'in_conversion' && (
          <>
            <Form.Item
              label={translate('converted')}
              name="converted"
              rules={[
                {
                  required: status === 'prospecting' || status === 'in_conversion',
                },
              ]}
            >
              <Radio.Group onChange={handleConvertedChange}>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>

            {isConverted == true && (
              <>
                <>
                  <Form.Item
                    label={translate('mou_sign_date')}
                    name="mou_sign_date"
                    rules={[
                      {
                        required: true,
                        message: translate('please_select_mou_sign_date'),
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD-MM-YYYY"
                      onChange={(date) =>
                        handleFieldChange(
                          'date_of_MOU_signing',
                          date ? dayjs(date).format('YYYY-MM-DD') : null
                        )
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label={translate('mou_start_date')}
                    name="mou_start_date"
                    rules={[
                      {
                        required: true,
                        message: translate('please_select_mou_start_date'),
                      },
                    ]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                  </Form.Item>

                  <Form.Item
                    label={translate('mou_end_date')}
                    name="mou_end_date"
                    rules={[
                      {
                        required: true,
                        message: translate('please_select_mou_end_date'),
                      },
                    ]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                  </Form.Item>

                  <Form.Item
                    label={translate('Confirmed Child Count')}
                    name="confirmed_child_count"
                    rules={[{ required: true, message: 'Please enter confirmed child count' }]}
                  >
                    <InputNumber
                      placeholder="Enter confirmed child count"
                      min={0}
                      style={{ width: '100%' }}
                      onChange={(value) => handleFieldChange('confirmed_child_count', value)}
                    />
                  </Form.Item>
                </>

                <Form.Item
                  label={translate('MOU_document')}
                  name="mou_document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  rules={[
                    {
                      required: true,
                      message: translate('please_upload_mou_document'),
                    },
                  ]}
                >
                  <Upload
                    beforeUpload={(file) => {
                      const isLt15MB = file.size / 1024 / 1024 < 15;
                      if (!isLt15MB) {
                        window.alert(translate('File_size_should_be_less_than_15MB'));
                      }
                      return isLt15MB ? false : Upload.LIST_IGNORE; // prevent uploading and exclude from fileList
                    }}
                    onChange={(info) => handleFileChange(info.fileList)}
                  >
                    <Button icon={<UploadOutlined />}>{translate('Click_to_upload')}</Button>
                  </Upload>
                </Form.Item>

                {isMouSigned === 'no' && (
                  <Form.Item
                    label={translate('pending_mou_reason')}
                    name="pending_mou_reason"
                    rules={[
                      {
                        required: status === 'interested',
                        message: translate('please_select_reason_for_not_signing'),
                      },
                    ]}
                  >
                    <Select
                      onChange={(value) => handleFieldChange('reason_for_not_signing', value)}
                    >
                      <Select.Option value="waiting_for_signature">
                        Waiting for signature
                      </Select.Option>
                      <Select.Option value="final_approval">Final approval</Select.Option>
                      <Select.Option value="document_review">Document review</Select.Option>
                    </Select>
                  </Form.Item>
                )}

                <Form.Item
                  label={translate('specific_document_required')}
                  name="specific_doc_required"
                  rules={[
                    {
                      required: status === 'interested',
                      message: translate('please_select_specific_document_required'),
                    },
                  ]}
                >
                  <Radio.Group onChange={handleSpecificDocumentRequiredChange}>
                    <Radio value="true">Yes</Radio>
                    <Radio value="false">No</Radio>
                  </Radio.Group>
                </Form.Item>

                {isSpecificDocumentRequired === 'true' && (
                  <Form.Item
                    label={translate('specify_required_document')}
                    name="specify_required_document"
                  >
                    <Input
                      onChange={(e) =>
                        handleFieldChange('specify_required_document', e.target.value)
                      }
                    />
                  </Form.Item>
                )}
              </>
            )}

            {isConverted === false && (
              <>
                <Form.Item label={translate('current_status')} name="current_status" required>
                  <Select onChange={handleDelayedCurrentStatusChange}>
                    <Select.Option value="waiting_for_management_approval">
                      Waiting for management approval
                    </Select.Option>
                    <Select.Option value="mou_in_discussion">MOU in discussion</Select.Option>
                    <Select.Option value="space_issue">Space issue</Select.Option>
                    <Select.Option value="funding_concern">Funding concern</Select.Option>
                    <Select.Option value="other">Other</Select.Option>
                  </Select>
                </Form.Item>

                {delayedCurrentStatus === 'other' && (
                  <Form.Item
                    label={translate('if_any_other_status')}
                    name="if_any_other_status"
                    rules={[{ required: true, message: 'Please specify the other status' }]}
                  >
                    <Input
                      onChange={(e) => handleFieldChange('if_any_other_status', e.target.value)}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label={translate('expected_conversion_day_(No_of_days)')}
                  name="expected_conversion_day"
                  normalize={(value) => (value ? Number(value) : 0)} // Convert string to number
                >
                  <Input
                    onChange={(e) => handleFieldChange('expected_conversion_day', e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label={translate('follow_up_meeting_scheduled')}
                  name="follow_up_meeting_scheduled"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </>
            )}
          </>
        )}

        {/* {status === 'interested_but_facing_delay' && (
          <>
            <Form.Item label={translate('current_status')} name="current_status" required>
              <Select onChange={handleDelayedCurrentStatusChange}>
                <Select.Option value="waiting_for_management_approval">
                  Waiting for management approval
                </Select.Option>
                <Select.Option value="mou_in_discussion">MOU in discussion</Select.Option>
                <Select.Option value="space_issue">Space issue</Select.Option>
                <Select.Option value="funding_concern">Funding concern</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            {delayedCurrentStatus === 'other' && (
              <Form.Item
                label={translate('if_any_other_status')}
                name="if_any_other_status"
                rules={[{ required: true, message: 'Please specify the other status' }]}
              >
                <Input onChange={(e) => handleFieldChange('if_any_other_status', e.target.value)} />
              </Form.Item>
            )}

            <Form.Item
              label={translate('expected_timeline_for_conversion_(No_of_days)')}
              name="expected_timeline_for_conversion"
            >
              <Input
                onChange={(e) =>
                  handleFieldChange('expected_timeline_for_conversion', e.target.value)
                }
              />
            </Form.Item>

            <Form.Item
              label={translate('follow_up_meeting_scheduled')}
              name="follow_up_meeting_scheduled"
              valuePropName="checked"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </>
        )} */}

        {/* {status === 'not_interested' && (
          <>
            <Form.Item
              label={translate('reason_for_non_conversion')}
              name="reason_for_non_conversion"
              rules={[
                { required: true, message: translate('please_select_reason_for_non_conversion') },
              ]}
            >
              <Select
                onChange={(value) => handleFieldChange('reason_for_non_conversion', value)}
                options={[
                  { label: 'MoU content issues', value: 'MoU_content_issues' },
                  {
                    label: 'Needs permission from management',
                    value: 'needs_permission_from_management',
                  },
                  { label: "Class timings didn't work", value: 'class_timings_didnt_work' },
                  { label: 'Lack of space for classes', value: 'lack_of_space_for_classes' },
                  { label: 'No permission from parents', value: 'no_permission_from_parents' },
                  { label: 'Other', value: 'other' },
                ]}
              />
            </Form.Item>

            <Form.Item label={translate('if_any_other_reason')} name="if_any_other_reason">
              <Input onChange={(e) => handleFieldChange('if_any_other_reason', e.target.value)} />
            </Form.Item>

            <Form.Item
              label={translate('agreement_drop_date')}
              name="agreement_drop_date"
              rules={[{ required: true, message: translate('please_select_date_of_closing_lead') }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                onChange={(date) =>
                  handleFieldChange(
                    'date_of_closing_lead',
                    date ? dayjs(date).format('YYYY-MM-DD') : null
                  )
                }
              />
            </Form.Item>
          </>
        )} */}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {translate('Submit')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );
}
