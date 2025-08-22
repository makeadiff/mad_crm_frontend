import React, { useState, useEffect } from 'react';
import { Form, Select, message } from 'antd';
import useLanguage from '@/locale/useLanguage';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import { useCrudContext } from '@/context/crud';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { useSelector } from 'react-redux';

export default function LocationSelect({ nameState, nameCity, labelState, labelCity, required, disabled }) {
  const translate = useLanguage();
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const { state } = useCrudContext();
  const { isEditBoxOpen } = state;
  const { result: currentItem } = useSelector(selectCurrentItem);

  useEffect(() => {
    const fetchStateList = async () => {
      try {
        const auth = storePersist.get('auth');
        const token = auth?.current?.token;

        const response = await axios.get('state/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        // console.log("statelist response data :", response.data.states)
        if (response.status === 200) {
          setStateList(response.data.states);

          if (isEditBoxOpen) {
            await fetchCityList(currentItem.state_id);
          }
        } else {
          message.error(translate('Failed to fetch state list'));
        }
      } catch (error) {
        console.error('Error fetching state list:', error);
        message.error(translate('An error occurred while fetching the state list'));
      }
    };

    fetchStateList();
  }, []);

  const fetchCityList = async (stateId) => {
    try {
      const auth = storePersist.get('auth');
      const token = auth?.current?.token;
      const response = await axios.get('city/list', {
        params: { stateId },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.status === 200) {
        setCityList(response.data.cities);
      } else {
        message.error(translate('Failed to fetch city list'));
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleStateChange = async (stateId) => {
    setSelectedState(stateId);
    setCityList([]); // Reset city list when state changes

    await fetchCityList(stateId);
  };

  // const handleStateChange = async (stateId) => {
  //   setSelectedState(stateId);
  //   setCityList([]); // Reset city list when state changes

  //   try {
  //     const auth = storePersist.get('auth');
  //     const token = auth?.current?.token;
  //     const response = await axios.get(`${API_BASE_URL}city/list`, {
  //        params: { stateId },
  //       headers: { Authorization: `Bearer ${token}` },
  //       withCredentials: true,
  //     });

  //     if (response.status === 200) {
  //       setCityList(response.data.cities);
  //     } else {
  //       message.error(translate('Failed to fetch city list'));
  //     }
  //   } catch (error) {
  //     console.error('Error fetching cities:', error);
  //   }
  // };

  return (
    <>
      <Form.Item
        label={translate(labelState)}
        name={nameState}
        rules={[{ required: required || false }]}
      >
        <Select
          showSearch
          optionFilterProp="children"
          onChange={handleStateChange}
          style={{ width: '100%' }}
          placeholder={translate('Select a state')}
          notFoundContent={translate('No states found')}
          disabled = {disabled}
        >
          {stateList.map((state) => (
            <Select.Option key={state.id} value={state.id}>
              {translate(state.state_name)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* City Select Box (Dependent on State) */}
      <Form.Item
        label={translate(labelCity)}
        name={nameCity}
        rules={[{ required: required || false }]}
      >
        <Select
          showSearch
          optionFilterProp="children"
          disabled={!selectedState} // Disable until state is selected
          style={{ width: '100%' }}
          placeholder={translate('Select a city')}
          notFoundContent={translate('No cities found')}
          // value={cityList.find((city) => city.id === selectedState)?.id || null} // Ensure the correct city is shown
        >
          {cityList.map((city) => (
            <Select.Option key={city.id} value={city.id}>
              {translate(city.city_name)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}

