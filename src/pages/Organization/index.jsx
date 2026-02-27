import { useState } from 'react';
import { Form, Tabs } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { fields, inactiveFields } from './config';
import useLanguage from '@/locale/useLanguage';
import ReadOrganization from './ReadOrganization';
import PageInfoPopup from '@/components/CustomPopUp/PageInfoPopup';
import OrganizationForm from '@/forms/OrganizationForm';
import OrganizationDeleteModal from './OrganizationDeleteModal';
import MouRenewalForm from '@/forms/MouRenewalForm';

export default function Organization() {
  const translate = useLanguage();
  const [activeTab, setActiveTab] = useState('active');
  const isActive = activeTab === 'active';

  const entity = 'organization';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('organization'),
    DATATABLE_TITLE: isActive
      ? translate('organization_list')
      : translate('inactive_partners'),
    ADD_NEW_ENTITY: translate('add_new_organization'),
    ENTITY_NAME: translate('organization'),
  };

  const baseConfig = {
    entity,
    ...Labels,
    searchConfig,
    deleteModalLabels,
  };

  const activeConfig = {
    ...baseConfig,
    fields,
    permissions: {
      canDelete: ['Project Associate', 'Project Lead', 'Function Lead'],
    },
  };

  const inactiveConfig = {
    ...baseConfig,
    fields: inactiveFields,
    permissions: {
      canEdit: [],    // hide Edit action
      canDelete: [],  // hide Delete action
    },
  };

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const extraMenuItems = [
    {
      label: translate('review_mou'),
      key: 'review_mou',
      icon: <SyncOutlined />,
    },
  ];

  const tabItems = [
    { key: 'active',   label: 'Active Partners' },
    { key: 'inactive', label: 'Inactive Partners' },
  ];

  return (
    <>
      <PageInfoPopup
        heading={'Welcome to Organization Page'}
        message={'Manage organization: view, edit details'}
      />
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ paddingLeft: '8px', marginBottom: 0 }}
      />
      <CrudModule
        key={activeTab}
        config={isActive ? activeConfig : inactiveConfig}
        createForm={
          isActive ? (
            <OrganizationForm config={activeConfig} form={createForm} fields={fields} />
          ) : null
        }
        updateForm={
          isActive ? (
            <OrganizationForm
              config={activeConfig}
              form={updateForm}
              isUpdate={true}
              fields={fields}
            />
          ) : null
        }
        readItem={<ReadOrganization />}
        DeleteModalComponent={isActive ? OrganizationDeleteModal : null}
        extra={isActive ? extraMenuItems : []}
        renewalForm={isActive ? <MouRenewalForm /> : null}
        filterOptions={
          isActive
            ? { status: 'active' }
            : { status: 'inactive' }
        }
      />
    </>
  );
}
