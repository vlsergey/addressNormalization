import React, { PureComponent } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

type PropType = {
  children? : any,
  disabled? : ?boolean,
  inProgress? : ?boolean,
  onClick? : ?( any => any ),
};

type StateType = {
  inProgress : boolean,
};

export default class AutoDisableButtonWithSpinner extends PureComponent<PropType, StateType> {

  constructor() {
    super( ...arguments );

    this.state = {
      inProgress: false,
    };

    this.handleClick = this.handleClick.bind( this );
  }

  async handleClick() {
    const { onClick } = this.props;
    this.setState( { inProgress: true } );
    try {
      if ( onClick ) return await onClick( ...arguments );
    } finally {
      this.setState( { inProgress: false } );
    }
  }

  render() {
    /* eslint no-unused-vars: 0 */
    const { children, disabled, onClick, ...etc } = this.props;
    const inProgress : boolean = this.props.inProgress || this.state.inProgress || false;

    return <Button disabled={disabled || inProgress} onClick={this.handleClick} {...etc}>
      { inProgress && <>
        <Spinner animation="border" aria-hidden="true" as="span" role="status" size="sm" />
        {' '}
        </> }
      {children}
    </Button>;
  }

}
