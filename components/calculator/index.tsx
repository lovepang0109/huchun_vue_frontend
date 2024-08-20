import { Modal, ModalBody } from 'react-bootstrap'
interface props {
  show: boolean
  onClose: any
}
const CalculatorModal = ({ show, onClose }: props) => {
  const btnBinaryOp_click = (e: string) => { }
  const btnConst_click = (e: string) => { }
  const btnMemoryOp_click = (e: string) => { }
  const btnUnaryOp_click = (e: string) => { }
  const btnCommand_click = (e: string) => { }
  const btnNumeric_click = (e: string) => { }

  console.log(show, "cal")

  return (
    <div
      className="modal show"
      style={{ display: 'block' }}
    >
      {show && (
        <Modal.Dialog>
          <ModalBody>
            <div
              id="keyPad"
              className="ui-widget-content calc_container m-auto"
            >
              <div id="helptopDiv">
                <span>Scientific Calculator</span>
                <div id="keyPad_Help" className="help_back"></div>
                <div
                  style={{ display: 'none' }}
                  id="keyPad_Helpback"
                  className="help_back"
                ></div>
              </div>
              <div
                className="calc_close"
                id="closeButton"
                onClick={onClose}
              ></div>
              <div id="mainContentArea">
                <input
                  type="text"
                  id="keyPad_UserInput1"
                  className="keyPad_TextBox1"
                  readOnly
                />
                <div className="text_container">
                  <input
                    type="text"
                    id="keyPad_UserInput"
                    className="keyPad_TextBox"
                    maxLength={30}
                    readOnly
                  />
                  <span id="memory" className="memoryhide">
                    M
                  </span>
                </div>
                <div className="clear"></div>
                <div className="left_sec">
                  <div className="calc_row clear">
                    <a
                      id="keyPad_btnMod"
                      onClick={() => btnBinaryOp_click('keyPad_btnMod')}
                      className="keyPad_btnBinaryOp"
                    >
                      mod
                    </a>
                    <div className="degree_radian">
                      <input
                        type="radio"
                        name="degree_or_radian"
                        value="deg"
                        checked
                      />
                      Deg
                      <input type="radio" name="degree_or_radian" value="rad" />
                      Rad
                    </div>
                    <a
                      id="keyPad_btnPi"
                      onClick={() => btnConst_click('keyPad_btnPi')}
                      className="keyPad_btnConst"
                      style={{ visibility: 'hidden' }}
                    >
                      &#960;
                    </a>
                    <a
                      id="keyPad_btnE"
                      onClick={() => btnConst_click('keyPad_btnE')}
                      className="keyPad_btnConst"
                      style={{ visibility: 'hidden' }}
                    >
                      e
                    </a>
                    <a
                      id="keyPad_MC"
                      onClick={() => btnMemoryOp_click('keyPad_MC')}
                      className="keyPad_btnMemoryOp"
                    >
                      MC
                    </a>
                    <a
                      id="keyPad_MR"
                      onClick={() => btnMemoryOp_click('keyPad_MR')}
                      className="keyPad_btnMemoryOp"
                    >
                      MR
                    </a>
                    <a
                      id="keyPad_MS"
                      onClick={() => btnMemoryOp_click('keyPad_MS')}
                      className="keyPad_btnMemoryOp"
                    >
                      MS
                    </a>
                    <a
                      id="keyPad_M+"
                      onClick={() => btnMemoryOp_click('keyPad_M+')}
                      className="keyPad_btnMemoryOp"
                    >
                      M+
                    </a>
                    <a
                      id="keyPad_M-"
                      onClick={() => btnMemoryOp_click('keyPad_M-')}
                      className="keyPad_btnMemoryOp"
                    >
                      M-
                    </a>
                  </div>
                  <div className="calc_row clear">
                    <a
                      id="keyPad_btnSinH"
                      onClick={() => btnUnaryOp_click('keyPad_btnSinH')}
                      className="keyPad_btnUnaryOp min"
                    >
                      sinh
                    </a>
                    <a
                      id="keyPad_btnCosinH"
                      onClick={() => btnUnaryOp_click('keyPad_btnCosinH')}
                      className="keyPad_btnUnaryOp min"
                    >
                      cosh
                    </a>
                    <a
                      id="keyPad_btnTgH"
                      onClick={() => btnUnaryOp_click('keyPad_btnTgH')}
                      className="keyPad_btnUnaryOp min"
                    >
                      tanh
                    </a>
                    <a
                      id="keyPad_EXP"
                      onClick={() => btnBinaryOp_click('keyPad_EXP')}
                      className="keyPad_btnBinaryOp"
                    >
                      Exp
                    </a>
                    <a
                      id="keyPad_btnOpen"
                      onClick={() => btnBinaryOp_click('keyPad_btnOpen')}
                      className="keyPad_btnBinaryOp "
                    >
                      (
                    </a>
                    <a
                      id="keyPad_btnClose"
                      onClick={() => btnBinaryOp_click('keyPad_btnClose')}
                      className="keyPad_btnBinaryOp "
                    >
                      )
                    </a>
                    <a
                      id="keyPad_btnBack"
                      onClick={() => btnCommand_click('keyPad_btnBack')}
                      className="keyPad_btnCommand calc_arrows"
                    >
                      <div style={{ position: 'relative', top: '-3px' }}>
                        &#8592;
                      </div>
                    </a>
                    <a
                      id="keyPad_btnAllClr"
                      onClick={() => btnCommand_click('keyPad_btnAllClr')}
                      className="keyPad_btnCommand"
                    >
                      C
                    </a>
                    <a
                      id="keyPad_btnInverseSign"
                      onClick={() => btnUnaryOp_click('keyPad_btnInverseSign')}
                      className="keyPad_btnUnaryOp"
                    >
                      +/-
                    </a>
                    <a
                      id="keyPad_btnSquareRoot"
                      onClick={() => btnUnaryOp_click('keyPad_btnSquareRoot')}
                      className="keyPad_btnUnaryOp"
                    >
                      <div style={{ position: 'relative', top: '1px' }}>
                        &#8730;
                      </div>
                    </a>
                  </div>
                  <div className="calc_row clear" style={{ marginTop: '5px' }}>
                    <a
                      id="keyPad_btnAsinH"
                      onClick={() => btnUnaryOp_click('keyPad_btnAsinH')}
                      className="keyPad_btnUnaryOp min "
                    >
                      <span className="baseele">sinh</span>
                      <span className="superscript">-1</span>
                    </a>
                    <a
                      id="keyPad_btnAcosH"
                      onClick={() => btnUnaryOp_click('keyPad_btnAcosH')}
                      className="keyPad_btnUnaryOp min "
                    >
                      <span className="baseele">cosh</span>
                      <span className="superscript">-1</span>
                    </a>
                    <a
                      id="keyPad_btnAtanH"
                      onClick={() => btnUnaryOp_click('keyPad_btnAtanH')}
                      className="keyPad_btnUnaryOp min "
                    >
                      <span className="baseele">tanh</span>
                      <span className="superscript">-1</span>
                    </a>
                    <a
                      id="keyPad_btnLogBase2"
                      onClick={() => btnUnaryOp_click('keyPad_btnLogBase2')}
                      className="keyPad_btnUnaryOp"
                    >
                      <span className="baseele">log</span>
                      <span className="subscript">2</span>
                      <span className="baseele">x</span>
                    </a>
                    <a
                      id="keyPad_btnLn"
                      onClick={() => btnUnaryOp_click('keyPad_btnLn')}
                      className="keyPad_btnUnaryOp"
                    >
                      ln
                    </a>
                    <a
                      id="keyPad_btnLg"
                      onClick={() => btnUnaryOp_click('keyPad_btnLg')}
                      className="keyPad_btnUnaryOp"
                    >
                      log
                    </a>
                    <a
                      id="keyPad_btn7"
                      onClick={() => btnNumeric_click('keyPad_btn7')}
                      className="keyPad_btnNumeric"
                    >
                      7
                    </a>
                    <a
                      id="keyPad_btn8"
                      onClick={() => btnNumeric_click('keyPad_btn8')}
                      className="keyPad_btnNumeric"
                    >
                      8
                    </a>
                    <a
                      id="keyPad_btn9"
                      onClick={() => btnNumeric_click('keyPad_btn9')}
                      className="keyPad_btnNumeric "
                    >
                      9
                    </a>
                    <a
                      id="keyPad_btnDiv"
                      onClick={() => btnBinaryOp_click('keyPad_btnDiv')}
                      className="keyPad_btnBinaryOp"
                    >
                      /
                    </a>
                    <a
                      id="keyPad_%"
                      onClick={() => btnBinaryOp_click('keyPad_%')}
                      className="keyPad_btnBinaryOp"
                    >
                      %
                    </a>
                  </div>
                  <div className="calc_row clear">
                    <a
                      id="keyPad_btnPi"
                      onClick={() => btnConst_click('keyPad_btnPi')}
                      className="keyPad_btnConst"
                    >
                      &#960;
                    </a>
                    <a
                      id="keyPad_btnE"
                      onClick={() => btnConst_click('keyPad_btnE')}
                      className="keyPad_btnConst"
                    >
                      e
                    </a>
                    <a
                      id="keyPad_btnFact"
                      onClick={() => btnUnaryOp_click('keyPad_btnFact')}
                      className="keyPad_btnUnaryOp"
                    >
                      n!
                    </a>
                    <a
                      id="keyPad_btnYlogX"
                      onClick={() => btnBinaryOp_click('keyPad_btnYlogX')}
                      className="keyPad_btnBinaryOp "
                    >
                      <span className="baseele">log</span>
                      <span className="subscript">y</span>
                      <span className="baseele">x</span>
                    </a>
                    <a
                      id="keyPad_btnExp"
                      onClick={() => btnUnaryOp_click('keyPad_btnExp')}
                      className="keyPad_btnUnaryOp"
                    >
                      <span className="baseele">e</span>
                      <span className="superscript">x</span>
                    </a>
                    <a
                      id="keyPad_btn10X"
                      onClick={() => btnUnaryOp_click('keyPad_btn10X')}
                      className="keyPad_btnUnaryOp"
                    >
                      <span className="baseele">10</span>
                      <span className="superscript">x</span>
                    </a>

                    <a
                      id="keyPad_btn4"
                      onClick={() => btnNumeric_click('keyPad_btn4')}
                      className="keyPad_btnNumeric"
                    >
                      4
                    </a>
                    <a
                      id="keyPad_btn5"
                      onClick={() => btnNumeric_click('keyPad_btn5')}
                      className="keyPad_btnNumeric"
                    >
                      5
                    </a>
                    <a
                      id="keyPad_btn6"
                      onClick={() => btnNumeric_click('keyPad_btn6')}
                      className="keyPad_btnNumeric "
                    >
                      6
                    </a>
                    <a
                      id="keyPad_btnMult"
                      onClick={() => btnBinaryOp_click('keyPad_btnMult')}
                      className="keyPad_btnBinaryOp"
                    >
                      <div
                        style={{
                          position: 'relative',
                          top: '3px',
                          fontSize: '20px',
                        }}
                      >
                        *
                      </div>
                    </a>
                    <a
                      id="keyPad_btnInverse"
                      onClick={() => btnUnaryOp_click('keyPad_btnInverse')}
                      className="keyPad_btnUnaryOp"
                    >
                      <span className="baseele">1/x</span>
                    </a>
                  </div>
                  <div className="calc_row clear">
                    <a
                      id="keyPad_btnSin"
                      onClick={() => btnUnaryOp_click('keyPad_btnSin')}
                      className="keyPad_btnUnaryOp min "
                    >
                      sin
                    </a>
                    <a
                      id="keyPad_btnCosin"
                      onClick={() => btnUnaryOp_click('keyPad_btnCosin')}
                      className="keyPad_btnUnaryOp min"
                    >
                      cos
                    </a>
                    <a
                      id="keyPad_btnTg"
                      onClick={() => btnUnaryOp_click('keyPad_btnTg')}
                      className="keyPad_btnUnaryOp min"
                    >
                      tan
                    </a>
                    <a
                      id="keyPad_btnYpowX"
                      onClick={() => btnBinaryOp_click('keyPad_btnYpowX')}
                      className="keyPad_btnBinaryOp"
                    >
                      <span className="baseele">x</span>
                      <span className="superscript">y</span>
                    </a>
                    <a
                      id="keyPad_btnCube"
                      onClick={() => btnUnaryOp_click('keyPad_btnCube')}
                      className="keyPad_btnUnaryOp"
                    >
                      <span className="baseele">x</span>
                      <span className="superscript">3</span>
                    </a>
                    <a
                      id="keyPad_btnSquare"
                      onClick={() => btnUnaryOp_click('keyPad_btnSquare')}
                      className="keyPad_btnUnaryOp"
                    >
                      <span className="baseele">x</span>
                      <span className="superscript">2</span>
                    </a>
                    <a
                      id="keyPad_btn1"
                      onClick={() => btnNumeric_click('keyPad_btn1')}
                      className="keyPad_btnNumeric"
                    >
                      1
                    </a>
                    <a
                      id="keyPad_btn2"
                      onClick={() => btnNumeric_click('keyPad_btn2')}
                      className="keyPad_btnNumeric"
                    >
                      2
                    </a>
                    <a
                      id="keyPad_btn3"
                      onClick={() => btnNumeric_click('keyPad_btn3')}
                      className="keyPad_btnNumeric"
                    >
                      3
                    </a>
                    <a
                      id="keyPad_btnMinus"
                      onClick={() => btnBinaryOp_click('keyPad_btnMinus')}
                      className="keyPad_btnBinaryOp"
                    >
                      <div
                        style={{
                          position: 'relative',
                          top: '-1px',
                          fontSize: '20px',
                        }}
                      >
                        -
                      </div>
                    </a>
                  </div>
                  <div className="calc_row clear">
                    <a
                      id="keyPad_btnAsin"
                      onClick={() => btnUnaryOp_click('keyPad_btnAsin')}
                      className="keyPad_btnUnaryOp min"
                    >
                      <span className="baseele">sin</span>
                      <span className="superscript">-1</span>
                    </a>
                    <a
                      id="keyPad_btnAcos"
                      onClick={() => btnUnaryOp_click('keyPad_btnAcos')}
                      className="keyPad_btnUnaryOp min"
                    >
                      <span className="baseele">cos</span>
                      <span className="superscript">-1</span>
                    </a>
                    <a
                      id="keyPad_btnAtan"
                      onClick={() => btnUnaryOp_click('keyPad_btnAtan')}
                      className="keyPad_btnUnaryOp min"
                    >
                      <span className="baseele">tan</span>
                      <span className="superscript">-1</span>
                    </a>
                    <a
                      id="keyPad_btnYrootX"
                      onClick={() => btnBinaryOp_click('keyPad_btnYrootX')}
                      className="keyPad_btnBinaryOp"
                    >
                      <span className="superscript" style={{ top: '-8px' }}>
                        y
                      </span>
                      <span
                        className="baseele"
                        style={{ fontSize: '1.2em', margin: '-6px 0 0 -9px' }}
                      >
                        &#8730;x
                      </span>
                    </a>
                    <a
                      id="keyPad_btnCubeRoot"
                      onClick={() => btnUnaryOp_click('keyPad_btnCubeRoot')}
                      className="keyPad_btnUnaryOp"
                    >
                      <div style={{ fontSize: '20px' }}>&#8731; </div>
                    </a>
                    <a
                      id="keyPad_btnAbs"
                      onClick={() => btnUnaryOp_click('keyPad_btnAbs')}
                      className="keyPad_btnUnaryOp"
                    >
                      <span className="baseele">|x|</span>
                    </a>
                    <a
                      id="keyPad_btn0"
                      onClick={() => btnNumeric_click('keyPad_btn0')}
                      className="keyPad_btnNumeric"
                    >
                      0
                    </a>
                    <a
                      id="keyPad_btnDot"
                      onClick={() => btnNumeric_click('keyPad_btnDot')}
                      className="keyPad_btnNumeric "
                    >
                      .
                    </a>
                    <a
                      id="keyPad_btnPlus"
                      onClick={() => btnBinaryOp_click('keyPad_btnPlus')}
                      className="keyPad_btnBinaryOp"
                    >
                      +
                    </a>
                    <a
                      id="keyPad_btnEnter"
                      onClick={() => btnCommand_click('keyPad_btnEnter')}
                      className="keyPad_btnCommand "
                    >
                      <div style={{ marginBottom: '2px' }}>=</div>
                    </a>
                  </div>
                </div>
                <div className="clear"></div>
                <div
                  id="helpContent"
                  onMouseDown={() => false}
                  style={{ display: 'none' }}
                >
                  <h3 style={{ textAlign: 'center' }}>
                    <strong>Calculator Instructions</strong>
                  </h3>
                  Allows you to perform basic and complex mathematical
                  operations such as modulus, square root, cube root,
                  trigonometric, exponential, logarithmic, hyperbolic functions,
                  etc.
                  <br /> You can operate the calculator using the buttons
                  provided on screen with your mouse. <br />
                  <br />
                  <h3 style={{ textDecoration: 'underline', color: 'green' }}>
                    Do&apos;s:
                  </h3>
                  <ul>
                    <li>
                      {' '}
                      Be sure to press [C] when beginning a new calculation.
                    </li>
                    <li>
                      {' '}
                      Simply an equation using parenthesis and other
                      mathematical operators.
                    </li>
                    <li>
                      {' '}
                      Use the predefined operations such as p (Pi), log, Exp to
                      save time during calculation.
                    </li>
                    <li>
                      {' '}
                      Use memory function for calculating cumulative totals.
                    </li>
                    <strong>
                      [M+]: Will add displayed value to memory.
                      <br />
                      [MR]: Will recall the value stored in memory.
                      <br />
                      [M-]: Subtracts the displayed value from memory.
                    </strong>
                    <li>
                      {' '}
                      Be sure select the angle unit (Deg or Rad) before
                      beginning any calculation.
                    </li>
                    <strong>
                      Note: By default angle unit is set as Degree
                    </strong>
                  </ul>
                  <h3>
                    <span style={{ textDecoration: 'underline', color: 'red' }}>
                      Dont&apos;s:
                    </span>
                  </h3>
                  <ul>
                    <li> Perform multiple operations together.</li>
                    <li> Leave parenthesis unbalanced.</li>
                    <li>
                      {' '}
                      Change the angle unit (Deg or Rad) while performing a
                      calculation..
                    </li>
                  </ul>
                  <h3>
                    <span style={{ textDecoration: 'underline' }}>
                      Limitations:
                    </span>
                  </h3>
                  <ul>
                    <li> Keyboard operation is disabled.</li>
                    <li>
                      {' '}
                      The output for a Factorial calculation is precise up to 14
                      digits.
                    </li>
                    <li>
                      {' '}
                      The output for Logarithmic and Hyperbolic calculations is
                      precise up to 5 digits.
                    </li>
                    <li>
                      {' '}
                      Modulus (mod) operation performed on decimal numbers with
                      15 digits would not be precise.
                    </li>
                    <br />
                    <strong>
                      {' '}
                      Use mod operation only if the number comprises of less
                      than 15 digits i.e. mod operation provides best results
                      for smaller numbers.
                    </strong>
                    <br />
                    <li>
                      The range of value supported by the calculator is 10(-323)
                      to 10(308).
                    </li>
                  </ul>
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal.Dialog>
      )}
    </div>
  )
}

export default CalculatorModal
