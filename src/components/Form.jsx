import React from 'react';
import { Button, Checkbox, Form, Input } from 'antd';

/**
 * Genera un campo de formulario Ant Design basado en un objeto de configuración.
 * @param {object} field - La configuración del campo
 */
const renderField = (field) => {
  switch (field.type) {
    case 'password':
      return (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          rules={field.rules}
        >
          <Input.Password placeholder={field.placeholder} />
        </Form.Item>
      );

    case 'checkbox':
      return (
        <Form.Item
          key={field.name}
          name={field.name}
          valuePropName="checked"
          // Mueve el wrapperCol aquí para alinear el checkbox
          wrapperCol={{ offset: 8, span: 16 }} 
        >
          <Checkbox>{field.label}</Checkbox>
        </Form.Item>
      );

    case 'text':
    default:
      return (
        <Form.Item
          key={field.name}
          label={field.label}
          name={field.name}
          rules={field.rules}
        >
          <Input placeholder={field.placeholder} />
        </Form.Item>
      );
  }
};

/**
 * Un componente de formulario dinámico que renderiza campos
 * basado en un array de configuración.
 *
 * @param {array} fields - Array de objetos de configuración de campo.
 * @param {function} onFinish - Función a llamar en envío exitoso.
 * @param {function} onFinishFailed - Función a llamar en envío fallido.
 * @param {string} submitText - Texto para el botón de envío.
 * @param {object} layoutProps - Props de layout para el <Form> (ej. labelCol, wrapperCol).
 */
const DynamicForm = ({ 
  fields = [], 
  onFinish, 
  onFinishFailed, 
  submitText = 'Submit', 
  ...layoutProps 
}) => {
  return (
    <Form
      name="dynamic-form"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      style={{ maxWidth: 600 }}
      {...layoutProps} // Pasa props como labelCol, wrapperCol, initialValues
    >
      {/* Mapea el array de configuración para renderizar cada campo */}
      {fields.map(renderField)}

      {/* Botón de envío */}
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DynamicForm;