import { useCallback, useEffect } from 'react';

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import {
  Dropdown,
  Table,
  Button,
  Input,
  Card,
  Skeleton,
  Pagination,
  Descriptions,
  Typography,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';

import { generate as uniqueId } from 'shortid';

import { useCrudContext } from '@/context/crud';
import useResponsive from '@/hooks/useResponsive';
import { PlusOutlined } from '@ant-design/icons';

function AddNewItem({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;
  const { isMobile } = useResponsive();

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary">
      {!isMobile ? ADD_NEW_ENTITY : <PlusOutlined /> }
    </Button>
  );
}
export default function DataTable({ config, extra = [] }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const { isMobile } = useResponsive();

  const { Text } = Typography;

  const items = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },

    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];
  
  const { state } = useCrudContext();
  const handleRead = (record) => {
    console.log('Before calling readBox.open(), isReadBoxOpen:', state.isReadBoxOpen);
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
    console.log('After calling readBox.open(), isReadBoxOpen:', state.isReadBoxOpen);
  };
  function handleEdit(record) {
    // console.log("sending Editing record :", record)
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  function handleDelete(record) {
    console.log("sending deleting record :", record)
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  function handleUpdatePassword(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    advancedBox.open();
    panel.open();
    collapsedBox.open();
  }

  let dispatchColumns = [];
  if (fields) {
    dispatchColumns = [...dataForTable({ fields, translate, moneyFormatter, dateFormat })];
  } else {
    dispatchColumns = [...dataTableColumns];
  }

  dataTableColumns = [
    ...dispatchColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;

                case 'delete':
                  handleDelete(record);
                  break;
                case 'updatePassword':
                  handleUpdatePassword(record);
                  break;

                default:
                  break;
              }
              // else if (key === '2')handleCloseTask
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback((pagination) => {
    // console.log('Loading data for page:', pagination.current);
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(crud.list({ entity, options }));
  }, []);

  const filterTable = (e) => {
    const value = e.target.value;
    const options = { q: value, fields: searchConfig?.searchFields || '' };
    dispatch(crud.list({ entity, options }));
  };

  const dispatcher = () => {
    dispatch(crud.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  // const tableStyles = {
  //   // Make table use full width on mobile
  //   '@media (max-width: 768px)': {
  //     '.ant-table': {
  //       width: '100%',
  //       margin: '0',
  //       padding: '0',
  //     },
  //     '.ant-table-container': {
  //       padding: '0',
  //     },
  //     // Adjust column widths for mobile
  //     '.ant-table-cell': {
  //       padding: '8px 4px !important',
  //       whiteSpace: 'nowrap',
  //       overflow: 'hidden',
  //       textOverflow: 'ellipsis',
  //     },
  //   },
  // };

  const tableProps = {
    // scroll: { x: true },
    // // Add responsive configuration
    // responsive: ['xs', 'sm', 'md'],
    // // Customize which columns to show at different breakpoints
    columns: dataTableColumns.map((column) => ({
      ...column,
      responsive: ['xs', 'sm', 'md'],
    })),
  };

  const pageHeaderStyles = {
    padding: '10px 0px',
    '@media (max-width: 768px)': {
      '.ant-page-header-heading': {
        padding: '0 8px',
      },
      '.ant-page-header-content': {
        padding: '8px',
      },
    },
  };

  // console.log("table data source in table :", dataSource )
  // console.log('dataTableColumns values in table :', dataTableColumns);
  // console.log("pagination value in data table :", pagination)
  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        extra={[
          <Input
            key={`searchFilterDataTable}`}
            onChange={filterTable}
            placeholder={translate('search')}
            allowClear
            style={{
              width: '100%',
              marginBottom: '8px',
              '@media (min-width: 768px)': {
                width: 'auto',
                marginBottom: 0,
              },
            }}
          />,
          <Button
            onClick={handelDataTableLoad}
            key={`${uniqueId()}`}
            icon={<RedoOutlined />}
            style={{
              marginBottom: '8px',
              '@media (min-width: 768px)': {
                marginBottom: 0,
              },
            }}
          >
            {!isMobile && translate('Refresh')}
          </Button>,
          // <AddNewItem key={`${uniqueId()}`} config={config} />,
          config.visibleAddNewEntity && <AddNewItem key={`${uniqueId()}`} config={config} />,
        ]}
        // style={{
        //   padding: '10px 0px',
        // }}/

        style={pageHeaderStyles}
      ></PageHeader>

      {isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {listIsLoading ? (
            <>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
            </>
          ) : (
            <>
              {dataSource.map((item) => (
                <Card
                  key={item._id}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #f0f0f0',
                  }}
                  actions={[
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handleRead(item)} />,
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(item)} />,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item)}
                    />,
                  ]}
                >
                  <Descriptions column={1} size="small">
                    {dataTableColumns
                      .filter((col) => col.dataIndex && col.dataIndex.length)
                      .map((col) => {
                        let value = col.dataIndex.reduce((acc, key) => acc?.[key], item);

                        if (col.render) {
                          value = col.render(value, item);
                        }

                        return (
                          <Descriptions.Item key={col.dataIndex.join('.')} label={col.title}>
                            {value || '-'}
                          </Descriptions.Item>
                        );
                      })}
                  </Descriptions>
                </Card>
              ))}

              {/* Pagination for Mobile */}
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={(page) =>
                  handelDataTableLoad({ current: page, pageSize: pagination.pageSize })
                }
                showSizeChanger={false}
                style={{ textAlign: 'center', marginTop: 16 }}
              />
            </>
          )}
        </div>
      )}

      {!isMobile && (
        <div style={{ padding: '0px 8px' }}>
          <Table
            {...tableProps}
            columns={dataTableColumns}
            rowKey={(item) => item._id}
            dataSource={dataSource}
            pagination={pagination}
            loading={listIsLoading}
            onChange={handelDataTableLoad}
            scroll={{ x: true }}
            // style={tableStyles}
          />
        </div>
      )}
    </>
  );
}
