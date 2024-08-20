'use client'
import { useEffect, useState } from 'react'
import {useDropzone} from 'react-dropzone';

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 0,
  width: '100%',
  height: '100%',
  padding: 4,
  boxSizing: 'border-box',
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

const DropzoneContainer = ({onDropped} : any) => {
  const [files, setFiles] = useState([]);
  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: acceptedFiles => {
      //@ts-ignore
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
      onDropped(acceptedFiles);
    }
  });
  
  const thumbs = files.map((file: any) => (
    //@ts-ignore
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
          // Revoke data uri after image is loaded
          onLoad={() => { URL.revokeObjectURL(file.preview) }}
        alt=''/>
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file: any) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <div>
      <section className="dropzone-container">
        <div {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <h2 className="upload_icon"><span className="material-icons">file_copy</span></h2>
          <p>Drag & drop your photo, or click to select files</p>
          <p className="text-dark">For optimal view, we recommend size <span className="text-danger">190px * 200px</span></p>
        </div>
      </section>
      {/*
        //@ts-ignore */}
        <aside style={thumbsContainer}>
          {thumbs}
        </aside>
    </div>
  );
}
export default DropzoneContainer