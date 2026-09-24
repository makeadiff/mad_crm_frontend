import React from 'react';
import { Form, Select, Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function CustomColorSelect({ name, label, required, options, disabled }) {
  const translate = useLanguage();

  return (
    <Form.Item
      label={translate(label)}
      name={name}
      rules={[
        {
          required: (required && !disabled) || false, // can't be edited → don't validate
        },
      ]}
    >
      <Select
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: '100%' }}
        optionLabelProp="label"
        disabled = {disabled}
      >
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value} label={option.label}>
            <Tag color={option.color} style={{ border: 'none' }}>
              {option.label}
            </Tag>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
