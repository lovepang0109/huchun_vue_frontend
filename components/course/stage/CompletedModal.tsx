import { Modal } from "react-bootstrap";

interface props {
  show: boolean;
  onClose: any;
  course: any;
  gotoCertificate: any;
}

const CompletedModal = ({ show, onClose, course, gotoCertificate }: props) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <figure className="mx-auto">
          <img src="/assets/images/Winners-pana1.png" alt="" />
        </figure>
        <h2 className="text-center">Congrats on Completing the course!</h2>
        <p className="text-center">
          You can still find this course in your collection
        </p>
        {course?.certificate && (
          <div className="text-center mt-5">
            <a className="btn btn-primary" onClick={gotoCertificate}>
              Get the Certificate
            </a>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CompletedModal