import React, { Component, createRef } from 'react';
import { Button } from 'react-bootstrap';
import '../App.css';
import '../common/style/common.style.css';

const CLOUDNAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOADPRESET = process.env.REACT_APP_CLOUDINARY_PRESET;

class CloudinaryUploadWidget extends Component {
  constructor(props) {
    super(props);
    this.buttonRef = createRef();
    this.myWidget = null;
  }

  componentDidMount() {
    const tryCreateWidget = () => {
      if (window.cloudinary && window.cloudinary.createUploadWidget) {
        this.myWidget = window.cloudinary.createUploadWidget(
          {
            cloudName: CLOUDNAME,
            uploadPreset: UPLOADPRESET,
          },
          (error, result) => {
            if (!error && result && result.event === 'success') {
              document
                .getElementById('uploadedimage')
                .setAttribute('src', result.info.secure_url);
              this.props.uploadImage(result.info.secure_url);
            }
          }
        );
        if (this.buttonRef.current) {
          this.buttonRef.current.addEventListener('click', this.openWidget);
        }
      } else {
        setTimeout(tryCreateWidget, 100);
      }
    };
    tryCreateWidget();
  }

  componentWillUnmount() {
    if (this.buttonRef.current) {
      this.buttonRef.current.removeEventListener('click', this.openWidget);
    }
  }

  openWidget = () => {
    if (this.myWidget) {
      this.myWidget.open();
    }
  };

  render() {
    return (
      <Button ref={this.buttonRef} size='sm' className='ml-2'>
        Upload Image +
      </Button>
    );
  }
}

export default CloudinaryUploadWidget;
