import React, { PureComponent } from 'react';
import Button from './AutoDisableButtonWithSpinner';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import ProgressBar from 'react-bootstrap/ProgressBar';

const DEFAULT_KEY = 'd29e7db7-209b-4701-ad89-2dd1a8cee66e';

export default class NormalizationForm extends PureComponent {

  constructor() {
    super( ...arguments );

    this.state = {
      key: '',
      src: 'Москва, Б. Татарская 11А',
      dst: '',
      progress: 0,
      progressMax: 100,
    };

    this.handleChange = this.handleChange.bind( this );
    this.handleNormalize = this.handleNormalize.bind( this );
  }

  handleChange( { target } ) {
    this.setState( { [ target.name ]: target.value } );
    return true;
  }

  async handleNormalize( ) {
    /* eslint react/no-access-state-in-setstate: 0 */
    const lines = ( this.state.src || '' )
      .split( /[\r\n]/ )
      .map( line => line.trim() )
      .filter( line => line !== '' );

    this.setState( { dst: '', progress: 0, progressMax: lines.length } );

    for ( let i = 0; i < lines.length; i++ ) {
      const args = {
        geocode: lines[ i ],
        apikey: this.state.key.trim().length === 0 ? DEFAULT_KEY : this.state.key,
        kind: 'house',
        format: 'json',
        lang: 'ru_RU',
      };
      const query = Object.keys( args )
        .map( arg => encodeURIComponent( arg ) + '=' + encodeURIComponent( args[ arg ] ) )
        .join( '&' );

      await fetch( 'https://geocode-maps.yandex.ru/1.x/?' + query )
        .then( response => response.json() )
        .then( json => {
          const geoObject = ( ( ( ( json.response || {} ).GeoObjectCollection || {} ).featureMember || [] )[ 0 ] || {} ).GeoObject;
          if ( !geoObject ) {
            this.setState( ( { dst } ) => ( { dst: dst + '\n' } ) );
            return;
          }
          // Due to historical reasons coordinates in Yandex in form [longitude latitude]
          const [ long, lat ] = geoObject.Point.pos.split( ' ' );

          const text = geoObject.metaDataProperty.GeocoderMetaData.text;
          const line = lat + '\t' + long + '\t' + text;
          this.setState( ( { dst } ) => ( { dst: dst + line + '\n' } ) );
        } )
        .catch( exc => {
          this.setState( ( { dst } ) => ( { dst: dst + exc + '\n' } ) );
        } );

      this.setState( { progress: i } );
    }
    this.setState( { progress: lines.length } );
  }

  render() {
    const { state } = this;

    return <Container>
      <h1>Нормализация адресов с использованием API <a href="https://tech.yandex.ru/maps/geocoder/">Яндекс.Геокодера</a></h1>
      <Form onSubmit={this.handleSubmit}>
        <Form.Group controlId="key">
          <Form.Label>Ключ разработчика от API Яндекс.Геокодера</Form.Label>
          <Form.Control
            name="key"
            onChange={this.handleChange}
            placeholder={'Например: ' + DEFAULT_KEY}
            rows="10"
            type="text"
            value={state.key || ''} />
          <Form.Control.Feedback />
        </Form.Group>
        <Form.Group controlId="src">
          <Form.Label>Список адресов (по одному на каждой строке) для нормализации</Form.Label>
          <Form.Control
            as="textarea"
            name="src"
            onChange={this.handleChange}
            rows="10"
            type="text"
            value={state.src || ''} />
          <Form.Control.Feedback />
        </Form.Group>
        <Form.Group>
          <ProgressBar animated={this.state.progressMax !== this.state.progress} max={this.state.progressMax} now={this.state.progress} />
        </Form.Group>
        <Form.Group controlId="dst">
          <Form.Label>Нормализованные адреса в виде CSV</Form.Label>
          <Form.Control
            as="textarea"
            name="dst"
            onChange={this.handleChange}
            rows="10"
            type="text"
            value={state.dst || ''} />
          <Form.Control.Feedback />
        </Form.Group>
        <Button onClick={this.handleNormalize} type="button" variant="primary">Нормализовать</Button>
      </Form>
    </Container>;
  }

}
