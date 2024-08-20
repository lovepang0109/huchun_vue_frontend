'use client'

interface props {
  handleNextInstruction: any
  startTest: any
}
const StepFive = ({ handleNextInstruction, startTest }: props) => {
  return (
    <>
      <section className="question tutorial-exm_new">
        <div className="question-area">
          <div className="row m-0">
            <div className="col-lg-8 p-0">
              <div className="board">
                <div className="heading">
                  <div className="row">
                    <div className="col-lg-6">
                      <ul className="nav info">
                        <li className="pl-0">Question</li>
                        <li className="count text-white clearfix">
                          <span>1</span>
                          <span> / </span>
                          <span>30</span>
                        </li>
                        <li className="d-none d-lg-block">
                          <a href="#">
                            <figure>
                              <img src="/assets/images/refress.png" alt="" />
                            </figure>
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="col-lg-6">
                      <div className="btn-group ml-auto">
                        <ul className="nav">
                          <li className="edit">
                            <a href="#">
                              <figure>
                                <img
                                  src="/assets/images/edit-icon-white.png"
                                  alt=""
                                />
                              </figure>
                            </a>
                          </li>

                          <li className="calc">
                            <a href="#">
                              <figure>
                                <img
                                  src="/assets/images/calc-icon.png"
                                  alt=""
                                />
                              </figure>
                            </a>
                          </li>

                          <li className="report bg-white">
                            <a
                              href="#"
                              className="text-uppercase"
                              type="button"
                              data-toggle="modal"
                              data-target="#report-modal"
                            >
                              REPORT ISSUE
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="title">
                  <div className="row mx-0">
                    <div className="col-6 px-0">
                      <h4 className="text-white">Single Correct Answer</h4>
                    </div>

                    <div className="col-6 px-0">
                      <div className="title-right ml-auto">
                        <ul className="nav">
                          <li className="text-white">Marking Scheme</li>

                          <li className="number">+4</li>

                          <li className="number">-1</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="question-box bg-white">
                  <div className="question-item">
                    <span>
                      If the cube roots of unity are 1, w, w2, then the roots of
                      the equation (x – 1)3 + 8 = 0 are
                    </span>
                  </div>

                  <div className="answer-box">
                    <ul>
                      <li className="clearfix">
                        <div className="answer clearfix">
                          <span className="pl-3">-1, 1-2w, 1-2w^2</span>
                        </div>
                      </li>

                      <li className="clearfix">
                        <div className="answer clearfix">
                          <span className="pl-3">-1, 1-2w, 1-2w^2</span>
                        </div>
                      </li>

                      <li className="clearfix">
                        <div className="answer clearfix">
                          <span className="pl-3">-1, 1-2w, 1-2w^2</span>
                        </div>
                      </li>

                      <li className="clearfix">
                        <div className="answer clearfix">
                          <span className="pl-3">-1, 1-2w, 1-2w^2</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="button-group">
                  <div className="row">
                    <div className="col-8">
                      <div className="left-btn-group clearfix">
                        <div className="clear-btn">
                          <a className="text-white" href="#">
                            Clear
                          </a>
                        </div>

                        <div className="review-next-btn d-lg-block d-none">
                          <a className="text-white" href="#">
                            Mark For Review & Next
                          </a>
                        </div>

                        <div className="save-btn d-lg-block d-none">
                          <a className="text-white" href="#">
                            Save & Mark For Review
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="col-4">
                      <div className="right-btn-group clearfix ml-auto d-lg-block d-none">
                        <div className="previous-btn">
                          <a className="text-white" href="#">
                            Previous
                          </a>
                        </div>

                        <div className="save-next-btn">
                          <a className="text-white" href="#">
                            Save and Next
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 p-0">
              <div className="statics">
                <ul className="nav instruction">
                  <li className="clearfix">
                    <div className="number red">
                      <span className="text-center text-white p-0">1</span>
                    </div>
                    <span>Unattempted</span>
                  </li>

                  <li className="clearfix">
                    <div className="number blue">
                      <span className="text-center text-white p-0">5</span>
                    </div>
                    <span>Marked for Review</span>
                  </li>

                  <li className="clearfix">
                    <div className="number green">
                      <span className="text-center text-white p-0">3</span>
                    </div>
                    <span>Answered</span>
                  </li>

                  <li className="clearfix">
                    <div className="number blue">
                      <span className="circle text-center text-white p-0">
                        5
                      </span>
                    </div>
                    <span className="pt-0">Answered and Marked for review</span>
                  </li>
                </ul>

                <div className="accordion bg-white" id="accordion">
                  <div className="item">
                    <div id="headingOne">
                      <h2>
                        <button
                          className="active bg-white border-0 text-left"
                          type="button"
                          data-toggle="collapse"
                          data-target="#collapseOne"
                          aria-expanded="true"
                          aria-controls="collapseOne"
                        >
                          Section A
                        </button>
                      </h2>
                    </div>

                    <div
                      id="collapseOne"
                      className="collapse show pr-4"
                      aria-labelledby="headingOne"
                      data-parent="#accordion"
                    >
                      <table className="table mb-0">
                        <tbody>
                          <tr>
                            <td className="red">1</td>
                            <td>2</td>
                            <td className="green">3</td>
                            <td>4</td>
                            <td className="blue">5</td>
                            <td className="blue circle">6</td>
                            <td>7</td>
                            <td>8</td>
                          </tr>

                          <tr>
                            <td>9</td>
                            <td>10</td>
                            <td>11</td>
                            <td>12</td>
                            <td>13</td>
                            <td>14</td>
                            <td>15</td>
                            <td>16</td>
                          </tr>

                          <tr>
                            <td>17</td>
                            <td>18</td>
                            <td>19</td>
                            <td>20</td>
                            <td>21</td>
                            <td>22</td>
                            <td>23</td>
                            <td>24</td>
                          </tr>

                          <tr>
                            <td>25</td>
                            <td>26</td>
                            <td>27</td>
                            <td>28</td>
                            <td>29</td>
                            <td>30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="item">
                    <div id="headingTwo">
                      <h2>
                        <button
                          className="bg-white border-0 text-left collapsed"
                          type="button"
                          data-toggle="collapse"
                          data-target="#collapseTwo"
                          aria-expanded="false"
                          aria-controls="collapseTwo"
                        >
                          Section B
                        </button>
                      </h2>
                    </div>

                    <div
                      id="collapseTwo"
                      className="collapse pr-4"
                      aria-labelledby="headingTwo"
                      data-parent="#accordion"
                    >
                      <table className="table mb-0">
                        <tbody>
                          <tr>
                            <td className="red">1</td>
                            <td>2</td>
                            <td className="green">3</td>
                            <td>4</td>
                            <td className="blue">5</td>
                            <td className="blue circle">6</td>
                            <td>7</td>
                            <td>8</td>
                          </tr>

                          <tr>
                            <td>9</td>
                            <td>10</td>
                            <td>11</td>
                            <td>12</td>
                            <td>13</td>
                            <td>14</td>
                            <td>15</td>
                            <td>16</td>
                          </tr>

                          <tr>
                            <td>17</td>
                            <td>18</td>
                            <td>19</td>
                            <td>20</td>
                            <td>21</td>
                            <td>22</td>
                            <td>23</td>
                            <td>24</td>
                          </tr>

                          <tr>
                            <td>25</td>
                            <td>26</td>
                            <td>27</td>
                            <td>28</td>
                            <td>29</td>
                            <td>30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="button-group bg-white d-block d-lg-none fixed-bottom">
            <div className="review-next-btn">
              <a className="text-center" href="#">
                Mark For Review
              </a>
            </div>

            <div className="save-btn">
              <a className="text-center" href="#">
                Save & Mark For Review
              </a>
            </div>

            <div className="previous-btn">
              <a className="text-white text-center">Previous</a>
            </div>

            <div className="save-next-btn">
              <a className="text-white text-center" href="#">
                Save and Next
              </a>
            </div>
          </div>
        </div>
      </section>
      <div
        className="modal fade show"
        id="report-modal"
        // tabindex="-1"
        aria-hidden="true"
        style={{ display: 'block' }}
      ></div>

      <div className="card-box instruction-four">
        <div className="card-box-wrap">
          <div className="card-box-inner bg-white">
            <div className="card-box-content">
              <p>Take a quick peek at your progress here</p>
            </div>
          </div>

          <div className="card-box-footer bg-white">
            <div className="indicators">
              <ul className="nav">
                <li>
                  <a href="#"></a>
                </li>
                <li>
                  <a href="#"></a>
                </li>
                <li>
                  <a href="#"></a>
                </li>
                <li className="active">
                  <a href="#"></a>
                </li>
                <li>
                  <a href="#"></a>
                </li>
              </ul>
            </div>

            <div className="inner ml-auto">
              <ul className="nav">
                <li>
                  <a
                    className="btn btn-link btn-sm text-grey bold mr-2"
                    onClick={startTest}
                  >
                    Skip
                  </a>
                </li>
                <li>
                  <a
                    className="btn btn-primary btn-sm text-white"
                    onClick={() => handleNextInstruction('six')}
                  >
                    Next
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StepFive
