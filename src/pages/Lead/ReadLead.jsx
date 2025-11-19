import { Descriptions, Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import dayjs from 'dayjs';
import PartnerTrackingView from '../../components/LeadTracker/PartnerTrackingView';

export default function ReadLead() {
  console.log('ReadLead function called');
  const translate = useLanguage();
  const { result: currentItem } = useSelector(selectCurrentItem);

  console.log("current item in read Lead box :", currentItem)

  return (

    <>
      {Array.isArray(currentItem?.tracking_history) && (
        <PartnerTrackingView trackingData={currentItem.tracking_history} />
      )}
 
    <Descriptions bordered column={1}>
      {currentItem.conversion_stage && (
        <Descriptions.Item label={translate('conversion_stage')}>
          <Tag color="blue">{translate(currentItem?.conversion_stage)}</Tag>
        </Descriptions.Item>
      )}

      {currentItem.CO_Name && (
        <Descriptions.Item label={translate('CO_Name')}>
          {translate(currentItem?.co_name)}
        </Descriptions.Item>
      )}

      {currentItem.partner_name && (
        <Descriptions.Item label={translate('partner_name')}>
          {currentItem?.partner_name}
        </Descriptions.Item>
      )}

      {currentItem.state_name && (
        <Descriptions.Item label={translate('state')}>{currentItem?.state_name}</Descriptions.Item>
      )}

      {currentItem.city && (
        <Descriptions.Item label={translate('city')}>{currentItem?.city}</Descriptions.Item>
      )}

      <Descriptions.Item label={translate('address_line_1')}>
        {currentItem?.address_line_1}
      </Descriptions.Item>

      <Descriptions.Item label={translate('address_line_2')}>
        {currentItem?.address_line_2}
      </Descriptions.Item>

      <Descriptions.Item label={translate('pincode')}>{currentItem?.pincode}</Descriptions.Item>
      <Descriptions.Item label={translate('lead_source')}>
        {currentItem?.lead_source}
      </Descriptions.Item>

      {(currentItem?.conversion_stage === 'interested' ||
        currentItem?.conversion_stage === 'dropped' ||
        currentItem?.conversion_stage === 'interested_but_facing_delay') && (
        <>
          <Descriptions.Item label={translate('date_of_first_contact')}>
            {dayjs(currentItem.date_of_first_contact).format('DD-MM-YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Point_of_Contact_(POC)_Name')}>
            {currentItem?.poc_name}
          </Descriptions.Item>
          <Descriptions.Item label={translate('POC_Designation')}>
            {currentItem?.poc_designation}
          </Descriptions.Item>
          <Descriptions.Item label={translate('POC_Contact')}>
            {currentItem?.poc_contact}
          </Descriptions.Item>
          <Descriptions.Item label={translate('POC_Email')}>
            {currentItem?.poc_email}
          </Descriptions.Item>
          <Descriptions.Item label={translate('partner_affiliation_type')}>
            {translate(currentItem?.partner_affiliation_type)}
          </Descriptions.Item>
          <Descriptions.Item label={translate('school_type')}>
            {translate(currentItem?.school_type)}
          </Descriptions.Item>
          <Descriptions.Item label={translate('total_child_count')}>
            {currentItem?.total_child_count}
          </Descriptions.Item>
          <Descriptions.Item label={translate('potential_child_count')}>
            {currentItem?.potential_child_count}
          </Descriptions.Item>
          <Descriptions.Item label={translate('classes')}>
            {currentItem?.classes?.join(', ')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('low_income_resource')}>
            {currentItem?.low_income_resource ? 'yes' : 'no'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('interested')}>
            {currentItem?.interested ? 'yes' : 'no'}
          </Descriptions.Item>
        </>
      )}

      {currentItem?.conversion_stage == 'dropped' && (
        <>
          <Descriptions.Item label={translate('non_conversion_reason')}>
            {translate(currentItem?.non_conversion_reason)}
          </Descriptions.Item>
          <Descriptions.Item label={translate('agreement_drop_date')}>
            {dayjs(currentItem.agreement_drop_date).format('DD-MM-YYYY')}
          </Descriptions.Item>
        </>
      )}

      {currentItem?.conversion_stage == 'interested_but_facing_delay' && (
        <>
          <Descriptions.Item label={translate('current_status')}>
            {translate(currentItem?.current_status)}
          </Descriptions.Item>
          <Descriptions.Item label={translate('expected_conversion_day')}>
            {currentItem?.expected_conversion_day}
          </Descriptions.Item>
        </>
      )}

      {/* Interested Fields */}
      {currentItem?.mou_signed && (
        <>
          <Descriptions.Item label={translate('MOU_Signed')}>
            {currentItem?.mou_signed}
          </Descriptions.Item>
          {currentItem?.date_of_mou_signing && (
            <Descriptions.Item label={translate('date_of_MOU_signing')}>
              {dayjs(currentItem.date_of_mou_signing).format('DD-MM-YYYY')}
            </Descriptions.Item>
          )}
        </>
      )}

      {/* Not Interested Fields */}
      {currentItem?.reason_for_non_conversion && (
        <>
          <Descriptions.Item label={translate('reason_for_non_conversion')}>
            {currentItem?.reason_for_non_conversion}
          </Descriptions.Item>
          {currentItem?.date_of_closing_lead && (
            <Descriptions.Item label={translate('date_of_closing_lead')}>
              {dayjs(currentItem.date_of_closing_lead).format('DD-MM-YYYY')}
            </Descriptions.Item>
          )}
        </>
      )}
    </Descriptions>

    </>
  );
}
