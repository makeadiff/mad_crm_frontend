import { useLayoutEffect, useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import ReadItem from '@/components/ReadItem';
import SearchItem from '@/components/SearchItem';
import DataTable from '@/components/DataTable/DataTable';

import { useDispatch, useSelector } from 'react-redux';

import { selectCurrentItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';

import { CrudLayout } from '@/layout';
import LeadForm from '@/forms/LeadForm';

function SidePanelTopContent({ config, formElements, withUpload, readItem}) {
  // console.log("side pannel component is envolved")
  const translate = useLanguage();
  const { crudContextAction, state } = useCrudContext();
  const { deleteModalLabels } = config;
  const { modal, editBox } = crudContextAction;

  const { isReadBoxOpen, isEditBoxOpen } = state;
  // console.log(" is Edit Box open in side pannel content :", isEditBoxOpen)
  const { result: currentItem } = useSelector(selectCurrentItem);
  const dispatch = useDispatch();

  const [labels, setLabels] = useState('');
  useEffect(() => {
    if (currentItem) {
      const currentlabels = deleteModalLabels.map((x) => currentItem[x]).join(' ');

      setLabels(currentlabels);
    }
  }, [currentItem]);

  const removeItem = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: currentItem }));
    modal.open();
  };
  const editItem = () => {
    dispatch(crud.currentAction({ actionType: 'update', data: currentItem }));
    editBox.open();
  };

  const show = isReadBoxOpen || isEditBoxOpen ? { opacity: 1 } : { opacity: 0 };
  return (
    <>
      {/* <Row style={show} gutter={(24, 24)}>
        <Col span={10}>
          <p style={{ marginBottom: '10px' }}>Edit Poc Details</p>
        </Col>
        <Col span={14}>
          <Button
            onClick={removeItem}
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '5px', marginTop: '10px' }}
          >
            {translate('remove')}
          </Button>
          <Button
            onClick={editItem}
            type="text"
            icon={<EditOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
          >
            {translate('edit')}
          </Button>
        </Col>

        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row> */}

      <div style={{ textAlign: 'center', marginBottom: '15px', marginTop: '0px' }}>
        <h3 style={{ fontWeight: 'bold', color: '#333' }}>
          {isEditBoxOpen
            ? `Edit ${translate(config.entity)} Details`
            : `${translate(config.entity)} Details`}
        </h3>
      </div>

      {isReadBoxOpen && readItem}

      {/* <ReadItem config={config} /> */}
      {/* <UpdateForm config={config} formElements={formElements} withUpload={withUpload} /> */}

      {isEditBoxOpen && formElements}
      {/* {formElements} */}
    </>
  );
}

function FixHeaderPanel({ config }) {
  const { crudContextAction } = useCrudContext();

  const { collapsedBox } = crudContextAction;

  const addNewItem = () => {
    collapsedBox.close();
  };

  return (
    <Row gutter={8}>
      <Col className="gutter-row" span={21}>
        <SearchItem config={config} />
      </Col>
      <Col className="gutter-row" span={3}>
        <Button onClick={addNewItem} block={true} icon={<PlusOutlined />}></Button>
      </Col>
    </Row>
  );
}

function CrudModule({ config, createForm, updateForm, withUpload = false, submitButton= true, readItem, DeleteModalComponent }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  // ✅ Decide which delete modal to use
  const UsedDeleteModal = DeleteModalComponent || DeleteModal;

  return (
    <CrudLayout
      config={config}
      fixHeaderPanel={<FixHeaderPanel config={config} />}
      sidePanelBottomContent={
        // <CreateForm config={config} formElements={createForm} withUpload={withUpload} submitButton={submitButton} />
        createForm
      }
      sidePanelTopContent={
        <SidePanelTopContent config={config} formElements={updateForm} withUpload={withUpload} readItem={readItem} />
        // updateForm
      }
    >
      <DataTable config={config} />
      <UsedDeleteModal config={config} /> {/* ✅ uses injected or default */}
    </CrudLayout>
  );
}

export default CrudModule;
