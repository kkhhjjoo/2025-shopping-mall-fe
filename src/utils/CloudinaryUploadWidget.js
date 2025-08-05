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
    // Cloudinary 스크립트가 로드될 때까지 기다림
    this.initializeWidget();
  }

  initializeWidget = () => {
    const tryCreateWidget = () => {
      // 환경 변수 확인
      if (!CLOUDNAME || !UPLOADPRESET) {
        console.error('Cloudinary 환경 변수가 설정되지 않았습니다:', {
          CLOUDNAME,
          UPLOADPRESET
        });
        return;
      }

      // Cloudinary 객체 확인
      if (window.cloudinary && window.cloudinary.createUploadWidget) {
        try {
          this.myWidget = window.cloudinary.createUploadWidget(
            {
              cloudName: CLOUDNAME,
              uploadPreset: UPLOADPRESET,
              sources: ['local', 'url', 'camera'],
              multiple: false,
              maxFileSize: 10000000, // 10MB
              resourceType: 'image',
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary 업로드 에러:', error);
                return;
              }
              
              if (result && result.event === 'success') {
                console.log('업로드 성공:', result.info);
                const imageUrl = result.info.secure_url;
                
                // 이미지 미리보기 업데이트
                const uploadedImage = document.getElementById('uploadedimage');
                if (uploadedImage) {
                  uploadedImage.setAttribute('src', imageUrl);
                }
                
                // 부모 컴포넌트에 이미지 URL 전달
                if (this.props.uploadImage) {
                  this.props.uploadImage(imageUrl);
                }
              }
            }
          );
          
          console.log('Cloudinary 위젯 생성 성공');
        } catch (error) {
          console.error('위젯 생성 중 에러:', error);
        }
      } else {
        console.log('Cloudinary 스크립트 로드 대기 중...');
        setTimeout(tryCreateWidget, 500);
      }
    };

    tryCreateWidget();
  };

  componentWillUnmount() {
    if (this.buttonRef.current) {
      this.buttonRef.current.removeEventListener('click', this.openWidget);
    }
  }

  openWidget = (event) => {
    event.preventDefault();
    
    if (this.myWidget) {
      this.myWidget.open();
    } else {
      console.error('위젯이 초기화되지 않았습니다. 다시 시도해주세요.');
      // 위젯이 없으면 다시 초기화 시도
      this.initializeWidget();
    }
  };

  render() {
    return (
      <Button 
        ref={this.buttonRef} 
        size='sm' 
        className='ml-2'
        onClick={this.openWidget}
        type="button"
      >
        Upload Image +
      </Button>
    );
  }
}

export default CloudinaryUploadWidget;