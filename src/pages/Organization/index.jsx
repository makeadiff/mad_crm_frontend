import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import { Form } from 'antd';
import useLanguage from '@/locale/useLanguage';
import ReadOrganization from './ReadOrganization';
import PageInfoPopup from '@/components/CustomPopUp/PageInfoPopup';
import OrganizationForm from '@/forms/OrganizationForm';
import OrganizationDeleteModal from './OrganizationDeleteModal';

export default function Organization(){
  const translate = useLanguage();
  const entity = 'organization';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('organization'),
    DATATABLE_TITLE: translate('organization_list'),
    ADD_NEW_ENTITY: translate('add_new_organization'),
    ENTITY_NAME: translate('organization'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  return (
    <>
      <PageInfoPopup
        heading={'Welcome to Organization Page'}
        message={
          'Manage organization: view, edit details'
        }
      />
      <CrudModule
        createForm={<OrganizationForm config={config} form={createForm} fields={fields} />}
        // updateForm={<LeadForm config={config} form={updateForm} isUpdate={true} fields={fields} />}
        config={config}
        updateForm={<OrganizationForm config={config} form={updateForm} isUpdate={true} fields={fields} />}
        readItem={<ReadOrganization />}
        DeleteModalComponent={OrganizationDeleteModal}
      />
    </>
  );
}

