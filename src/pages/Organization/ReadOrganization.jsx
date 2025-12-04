import { Descriptions, Tag, Button } from 'antd';
import { LinkOutlined } from '@ant-design/icons'; // Import the external link icon
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import dayjs from 'dayjs';
import PartnerTrackingView from '@/components/LeadTracker/PartnerTrackingView';

export default function ReadOrganization() {
  // console.log('ReadLead function called');
  const translate = useLanguage();
  const { result: currentItem } = useSelector(selectCurrentItem);

  // console.log('current item in read Lead box :', currentItem);

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

      {currentItem?.conversion_stage === 'converted' && (
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
            {currentItem?.low_income_resource ? 'Yes' : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('interested')}>
            {currentItem?.interested ? 'Yes' : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Mou_Sign')}>
            {currentItem?.mou_sign == true ? 'Yes' : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('date_of_MOU_signing')}>
            {dayjs(currentItem.date_of_mou_signing).format('DD-MM-YYYY')}
          </Descriptions.Item>
          {/* MOU Document Link */}
          {currentItem?.mou_url && (
            <Descriptions.Item label={translate('MOU Document')}>
              <Button
                type="link"
                href={currentItem.mou_url}
                target="_blank"
                rel="noopener noreferrer"
                icon={<LinkOutlined />}
              >
                View Document
              </Button>
            </Descriptions.Item>
          )}
          <Descriptions.Item label={translate('mou_sign_date')}>
            {dayjs(currentItem.mou_sign_date).format('DD-MM-YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('mou_start_date')}>
            {dayjs(currentItem.mou_start_date).format('DD-MM-YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('mou_end_date')}>
            {dayjs(currentItem.mou_end_date).format('DD-MM-YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('confirmed_child_count')}>
            {currentItem?.confirmed_child_count}
          </Descriptions.Item>

          {currentItem?.specific_doc_required && (
            <Descriptions.Item label={translate('specific_doc_required')}>
              {currentItem?.specific_doc_required == true ? 'Yes' : 'No'}
            </Descriptions.Item>
          )}

          {currentItem?.specific_doc_name && (
            <Descriptions.Item label={translate('specific_doc_name')}>
              {currentItem?.specific_doc_name}
            </Descriptions.Item>
          )}
        </>
      )}
    </Descriptions>
    </>
  );
}
