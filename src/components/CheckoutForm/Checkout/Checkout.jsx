import React, { useState, useEffect } from 'react';
import { Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button, CssBaseline } from '@material-ui/core';

import { commerce } from '../../../lib/commerce';
import useStyle from './style';
import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';
import { Link, useHistory } from 'react-router-dom';

const steps = ['Адрес доставки', 'Детали платежа'];

const Checkout = ({ cart, order, onCaptureCheckout, error }) => {
  const classes = useStyle();
  const history = useHistory();
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [shippingData, setShippingData] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const generateToken = async () => {
      try{
        const token = await commerce.checkout.generateToken(cart.id, {type: 'cart'});
        setCheckoutToken(token);
      } catch (error) {
        console.group('Token error');
        console.log(error);
        console.groupEnd();
        history.pushState('/');
      }
    };

    generateToken();
  }, [cart]);

  const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
  const backStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
  const next = (data) => {
    setShippingData(data);
    nextStep();
  }
  const timeout = () => {
    setTimeout(() => {
        setIsFinished(true);
      }, 3000
    );
  }


  let Confirmation = () => order.customer ? (
    <>
      <div>
        <Typography variant="h5"> Спасибо за ваш заказ, уважаемый {order.customer.firstname} {order.customer.lastname}</Typography>
        <Divider className={classes.divider} />
        <Typography variant="subtitle2">Заказ {order.customer_reference}</Typography>
        <br/>
        <Button component={Link} to="/" variant="outlined" type="button">На главную страницу</Button>
      </div>
    </>
  ) : isFinished ? (
    <>
      <div>
        <Typography variant="h5"> Спасибо за ваш заказ.</Typography>
        <Divider className={classes.divider} />
        <br/>
        <Button component={Link} to="/" variant="outlined" type="button">На главную страницу</Button>
      </div>
    </>
  ) : (
    <div className={classes.spinner}>
      <CircularProgress />
    </div>
  );

  if( error ) (
    <>
      <Typography variant="h5">Error: {error}</Typography>
      <br/>
      <Button component={Link} to="/" variant="outlined" type="button">На главную страницу</Button>
    </>
  )

  const Form = () => (
    activeStep === 0
      ? <AddressForm checkoutToken={checkoutToken} next={next} />
      : <PaymentForm
        shippingData={shippingData}
        checkoutToken={checkoutToken}
        nextStep={nextStep}
        backStep={backStep}
        onCaptureCheckout={onCaptureCheckout}
        timeout={timeout}
      />
  );

  return (
    <>
      <CssBaseline  />
      <div className={classes.toolbar} />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography variant="h4" align="center">Оформление заказа</Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
        </Paper>
      </main>
    </>
  );
}

export default Checkout;