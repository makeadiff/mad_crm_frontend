import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { resetPassword } from '@/redux/auth/actions';
import { isLoggedIn, selectAuth } from '@/redux/auth/selectors';

import { Form, Button } from 'antd';

import ResetPasswordForm from '@/forms/ResetPasswordForm';

import useLanguage from '@/locale/useLanguage';

import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const ResetPassword = () => {
  const translate = useLanguage();
  const { isLoading, isSuccess, isLoggedIn } = useSelector(selectAuth);
  const navigate = useNavigate();

  const [token, setToken] = useState(null);

useEffect(() => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const tokenValue = params.get('token'); 

  if (tokenValue) {
    setToken(tokenValue);
  } else {
    navigate('/login', { replace: true });
  }
}, [navigate]);


useEffect(() => {
  if (isSuccess) {
    // console.log('Password reset successful, redirecting to login...');
    navigate('/login', { replace: true });
  }
}, [isSuccess, navigate]);

  const dispatch = useDispatch();
  const onFinish = (values) => {
    if (!token) return; // optionally show an error/redirect
    dispatch(
      resetPassword({
        resetPasswordData: {
          password: values.password,
          token: token,
        },
      })
    );
  };  


  const FormContainer = () => {
    return (
      <Loading isLoading={isLoading}>
        <Form
          name="signup"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <ResetPasswordForm />
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" size="large">
              {translate('update password')}
            </Button>
            {translate('Or')} <a href="/login"> {translate('already have account Login')} </a>
          </Form.Item>
        </Form>
      </Loading>
    );
  };
  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Reset Password" />;
};

export default ResetPassword;
