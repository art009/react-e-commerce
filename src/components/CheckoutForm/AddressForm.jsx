import React, { useState, useEffect } from 'react';
import { InputLabel, Select, MenuItem, Button, Grid, Typography } from '@material-ui/core';
import { useForm, FormProvider } from 'react-hook-form';
import { commerce } from '../../lib/commerce';
import { Link } from 'react-router-dom';

import FormInput from './CustomTextField'

const AddressForm = ({ checkoutToken, next }) => {
  const [ shippingCountries, setShippingCountries ] = useState([]);
  const [ shippingCountry, setShippingCountry ] = useState('');
  const [ shippingSubdivisions, setShippingSubdivisions ] = useState([]);
  const [ shippingSubdivision, setShippingSubdivision ] = useState('');
  const [ shippingOptions, setShippingOptions ] = useState([]);
  const [ shippingOption, setShippingOption ] = useState('');
  const methods = useForm();

  const countries = Object.entries(shippingCountries).map(([code, name]) => ({ id: code, label:name }) );
  const subdivisions = Object.entries(shippingSubdivisions).map(([code, name]) => ({ id: code, label:name }) );
  const options = shippingOptions.map((SO) => ({ id: SO.id, label:`${SO.description} - (${SO.price.formatted_with_symbol})` }) );

  const fetchShippingCounties = async (checkoutTokenId) => {
    const { countries } = await commerce.services.localeListShippingCountries(checkoutTokenId);

    setShippingCountries(countries);
    setShippingCountry(Object.keys(countries)[0]);
  }

  const fetchSubdivisions = async (countryCode) => {
    const { subdivisions } = await commerce.services.localeListSubdivisions(countryCode);

    setShippingSubdivisions(subdivisions);
    setShippingSubdivision(Object.keys(subdivisions)[0]);
  }

  const fetchShippingOptions = async (checkoutTokenId, country, region = null) => {
    const options = await commerce.checkout.getShippingOptions( checkoutTokenId,{ country, region });

    setShippingOptions(options);
    setShippingOption(Object.keys(options)[0]);
  }

  useEffect(() => {
    fetchShippingCounties(checkoutToken.id);
  }, []);

  useEffect(() => {
    if(shippingCountry) fetchSubdivisions(shippingCountry);
  }, [shippingCountry])

  useEffect(() => {
    if(shippingSubdivision) fetchShippingOptions(checkoutToken.id,shippingCountry,shippingSubdivision);
  }, [shippingSubdivision])

  return (
    <>
      <Typography variant="h6" gutterBottom>Адрес доставки</Typography>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit((data) => next({ ...data, shippingCountry, shippingSubdivision, shippingOption }))}>
          <Grid container spacing={3}>
            <FormInput name="firstName" label="Ваше имя" />
            <FormInput name="lastName" label="Ваша фамилия" />
            <FormInput name="address1" label="Адрес" />
            <FormInput name="email" label="E-mail" />
            <FormInput name="city" label="Город" />
            <FormInput name="zip" label="Индекс" />
            <Grid item xs={12} sm={6}>
              <InputLabel>Адрес доставки</InputLabel>
              <Select value={shippingCountry} fullWidth onChange={(e) => setShippingCountry(e.target.value)}>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel>Регион доставки</InputLabel>
              <Select value={shippingSubdivision} fullWidth onChange={(e)=>setShippingSubdivision(e.target.value)}>
                {subdivisions.map((subdivision) => (
                  <MenuItem key={subdivision.id} value={subdivision.id}>
                    {subdivision.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel>Способ доставки</InputLabel>
              <Select value={shippingOption} fullWidth onChange={(e) => setShippingOption(e.target.value)}>
                {options.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          <br/>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button component={Link} to="/cart" variant="oytlined">К корзине</Button>
            <Button type="submit" variant="contained" color="primary">Далее</Button>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default AddressForm;