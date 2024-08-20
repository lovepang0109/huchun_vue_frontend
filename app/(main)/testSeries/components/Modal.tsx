import React from 'react';

function TestSeriesModal(props) {
  const cancelModal = () => {
    console.log("close")
  }

  const createTestseries = () => {
    console.log("create")
  }
  return (
    <div>
      <div className="form-boxes">
        <div className="modal-header modal-header-bg justify-content-center">
          <h3 className="form-box_title">Create Test Series</h3>
        </div>
        <div className="modal-body form-boxes">
          <div className="create-course-modal create-ClassModalMain">
            <div className="class-board-info">
              <div className="mx-auto">
                <form>
                  <div className="form-group">
                    <h4 className="form-box_subtitle">Test Series Name</h4>
                    <input type="text" name="name" placeholder=" Name" required min="2" max="50" className="form-control form-control-sm" />
                    <hr />
                  </div>

                  <div className="form-group">
                    <h4 className="form-box_subtitle">Summary</h4>
                    <input type="text" name="name" placeholder=" Test Series summary" required className="form-control form-control-sm" />
                    <hr />
                  </div>

                  <div className="overflow-unset">
                    <div className="form-group">

                      <h4 className="form-box_subtitle">Subject name</h4>
                      {/* <div *ngIf="createSeriesSubjects; else loadingSubjects"> */}
                      {/* <ng-multiselect-dropdown name='subjects' [placeholder]="'Select subjects'" [settings]="{ */}
                      {/* //     singleSelection: false,
                    //   idField: '_id',
                    //   textField: 'name',
                    //   selectAllText: 'Select All',
                    //   unSelectAllText: 'UnSelect All',
                    //   itemsShowLimit: 5,
                    //   allowSearchFilter: true
                    //         }" [data]="createSeriesSubjects" [(ngModel)]="newSeriesParams.subjects">
                    // </ng-multiselect-dropdown>
                  // </div> */}

                      <hr />
                    </div>
                  </div>

                  <div>
                    <h4 className="form-box_subtitle">Upload Test Series Picture</h4>


                  </div>
                  <br />

                  <div className="text-right">
                    <a onClick={cancelModal} className="btn btn-light">Cancel</a>
                    <button type="submit" className="btn btn-primary ml-2" onClick={createTestseries}>Create</button>

                  </div>
                </form>
              </div>
            </div>
          </div >
        </div >
      </div >
    </div >
  )
}

export default TestSeriesModal;