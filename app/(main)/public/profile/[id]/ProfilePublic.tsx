"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import clientApi from "@/lib/clientApi";
import alertify from "alertifyjs";
import Link from "next/link";
import Posts from "@/app/(main)/home/Posts";
import { toQueryString, slugify } from "@/lib/validator";
import { TagsInput } from "react-tag-input-component";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faFacebookSquare,
  faInstagram,
  faLinkedin,
  faTwitter,
  faTwitterSquare,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import DropzoneContainer from "@/components/dropzone";
import { saveBlobFromResponse } from "@/lib/common";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

const ProfileBasic = () => {
  const { id } = useParams();
  const { push } = useRouter();

  const myself: any = useSession()?.data?.user?.info || {};
  const [getClientData, setClientData]: any = useState();
  const [user, setUser]: any = useState({});
  const [certificates, setCertificates]: any = useState([]);
  const [isFollow, setIsFollow]: any = useState(false);
  const [followers, setFollowers]: any = useState();
  const [followings, setFollowings]: any = useState([]);
  const [enrolledCourses, setEnrolledCourses]: any = useState();
  const [mutualFollows, setMutualFollows]: any = useState();
  const [mutualComp, setMutualComp]: any = useState(null);
  const [services, setServices]: any = useState([]);
  const [offerCourses, setOfferCourses]: any = useState([]);
  const [totalMentoring, setTotalMentoring]: any = useState(0);
  const [userId, setUserId]: any = useState("");
  const [currentRemove, setCurrentRemove]: any = useState();
  const [currentUnfollow, setCurrentUnfollow]: any = useState();
  const [reportReason, setReportReason]: any = useState();
  const [myown, setMyown]: any = useState(false);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setClientData(data);
  };

  const download = async (item: any) => {
    await clientApi.get(
      `/api/course/verifyCourseUserProgress/${item.course._id}`
    );
    const query = {
      user: user._id,
      course: item.course._id,
      directDownload: true,
    };

    const { data }: any = await clientApi.get(
      `/api/admin/reportData/exportcerificate/${toQueryString(query)}`
    );
    console.log(data);
    saveBlobFromResponse({ fileName: item.course.title, data });
  };

  const getPublicProfile = async () => {
    const { data } = await clientApi.get(`/api/users/publicProfile/${id}`);
    setUser(data);
    if (data.role == "teacher") {
      const myCourses = await clientApi.get(`/api/course/teacher/${id}`);
      setOfferCourses(myCourses.data);
    }
    if (data.role == "mentor") {
      setTotalMentoring();
      const mentors = await clientApi.get(
        `/api/classRooms/getPublicMentorStudents/${id}`
      );
      if (mentors.data && mentors.data.length > 0) {
        setTotalMentoring(mentors.data[0].total);
      }
    }
  };

  const getPublicEnrolledCourses = async () => {
    const { data } = await clientApi.get(
      `/api/course/publicEnrolledCourses/${id}`
    );
    setEnrolledCourses(data);
  };

  const remove = (student: any, template: any) => {
    setCurrentRemove(student);
  };

  const unfollowCall = (student: any) => {
    setCurrentUnfollow(student);
  };

  const follow = (
    _id: any = null,
    _status: any = null,
    unfollowMe: any = null,
    isModal: any = null,
    unfollowModal = false
  ) => {
    let id = user._id;
    if (_id) id = _id;
    let status = !isFollow;
    if (_status) status = _status;

    if (unfollowMe) status = false;
    if (unfollowModal) status = false;

    // this.userFollowService.follow({
    //   userId: id,
    //   state: status,
    //   unfollowMe: unfollowMe, // this will be true when user remove followers from him
    // }).subscribe((res: any) => {
    //   this.userSvc.getPublicProfile(userId).subscribe(u => {
    //     this.user = u;
    //     this.user.avatarLink = this.avatarPipe.transform(this.user)
    //     this.mutualFollows = []
    //     if (this.myself) {
    //       this.fetchFollowers()
    //       this.fetchFollowings()

    //       if (this.myself._id != this.userId) {
    //         this.userFollowService.amIFollow(this.userId).subscribe(obj => {
    //           if (obj && obj.status) {
    //             this.isFollow = obj.status;
    //           } else {
    //             this.isFollow = false
    //           }

    //         })
    //       }
    //     }
    //   })
    //   if (isModal) {
    //     cancel()
    //   } else {
    //     alertify.success(status ? 'Successfully following' : 'Removed successfully');
    //   }
    // }, (res: any) => {
    //   if (res.error?.message) {
    //     alertify.alert("Message",res.error.message);
    //   } else {
    //     alertify.alert("Message","Failed to follow this user")
    //   }
    // })
  };

  const fetchFollowers = () => {
    // followList(myself._id, user._id, "followers")
  };

  const fetchFollowings = () => {
    // followList(myself._id, user._id, "followings")
  };

  const followList = (id: any, userId: any, type: any) => {
    // this.userFollowService.followList({ id, userId, type }).subscribe((list: any) => {
    //   if (type == "followers") {
    //     this.followers = list
    //   } else {
    //     this.followings = list
    //   }
    //   this.processMutual(list)
    // }, (err) => {
    //   alertify.alert("Message",err);
    // })
  };

  // concurrent proccess by followers and followings can create issue. [ToDo] Need to correct this
  const processMutual = (list: any) => {
    // list.map(user => {
    //   if (user.iFollow && !this.isMutualIdAvaialbe(user.id))
    //     this.mutualFollows.push(user)
    // })
  };

  const isMutualIdAvaialbe = (id: any) => {
    let result = false;
    for (let i = 0; i < mutualFollows.length; i++) {
      if (id == mutualFollows[i].id) {
        result = true;
        break;
      }
    }
    return result;
  };

  const navigateCourse = (course: any) => {
    push(`/public/courses/${course._id}/${slugify(course.title)}`);
  };

  const openChat = (userId: any, name: any) => {
    // this.chatSvc.openChat(userId, name)
  };

  const cancel = () => {
    setCurrentRemove({});
    setCurrentUnfollow({});
  };

  const openReportModal = () => {
    // this.bsModalRef = this.modal.show(template, { class: 'modal-sm' });
  };

  const closeReportModal = () => {
    // this.bsModalRef.hide()
    // this.reportReason = ""
  };

  const reportUser = () => {
    // if (form.valid) {
    //   this.userSvc.reportUser(this.user._id, this.reportReason).subscribe(res => {
    //     alertify.success("This user is reported.")
    //     this.closeReportModal()
    //   }, res => {
    //     console.log(res)
    //     alertify.alert("Message","Failed to report this user.")
    //   })
    // }
  };

  const blockThisUser = () => {
    // this.userSvc.blockUser(this.user._id).subscribe(res => {
    //   alertify.success("This user is blocked.")
    //   this.user.isBlocked = true
    //   if (!this.myself.blockedUsers) {
    //     this.myself.blockedUsers = []
    //   }
    //   this.myself.blockedUsers.push(this.user._id)
    //   this.authService.updateCurrentUser(this.myself)
    //   // remove user from follow list
    //   console.log('block user')
    //   if (this.followings) {
    //     const idx = this.followings.findIndex(f => f.id == this.myself._id)
    //     if (idx > -1) {
    //       this.followings.splice(idx, 1)
    //     }
    //   }
    //   if (this.followers) {
    //     const idx = this.followers.findIndex(f => f.id == this.myself._id)
    //     if (idx > -1) {
    //       this.followers.splice(idx, 1)
    //     }
    //   }
    // }, res => {
    //   console.log(res)
    //   alertify.alert("Message","Failed to block this user.")
    // })
  };

  const unblockThisUser = () => {
    // this.userSvc.unblockUser(this.user._id).subscribe(res => {
    //   this.user.isBlocked = false
    //   const fidx = this.myself.blockedUsers.indexOf(this.user._id)
    //   if (fidx > -1) {
    //     this.myself.blockedUsers.splice(fidx, 1)
    //   }
    //   this.authService.updateCurrentUser(this.myself)
    //   alertify.success("This user is unblocked.")
    // }, res => {
    //   console.log(res)
    //   alertify.alert("Message","Failed to unblock this user.")
    // })
  };

  const notifyCopied = () => {
    alertify.set("notifier", "position", "top-right");
    alertify.success("Public link is copied to clipboard!");
  };
  const isIFollowing = () => {
    if (followings && followings.length > 0) {
      console.log(followings, userId, followings[0].id == myself._id);
      const index = followings.findIndex(
        (e: { id: any }) => e.id == myself._id
      );
      if (index > -1) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    getClientDataFunc();
    getPublicProfile();
    getPublicEnrolledCourses();
  }, []);

  return (
    <div>
      <section className="student-public-profile">
        <div className="container-box">
          <div className="section-1 section-bodys desktop-view">
            <div className="image">
              <img
                src={
                  (user && user.avatarLink) ||
                  "/assets/images/defaultProfile.png"
                }
                alt=""
              />
            </div>
            <div className="right-content">
              <div className="name-hadding ">
                <h4>{user && user.name}</h4>

                {user &&
                  myself &&
                  user._id != myself._id &&
                  !myself.isBlocked &&
                  !user.isBlocked && (
                    <span>
                      {!isIFollowing() && (
                        <button
                          onClick={() => follow()}
                          className="btn btn-primary"
                        >
                          {isFollow ? "Unfollow" : "Follow"}
                        </button>
                      )}
                      {isIFollowing() && (
                        <button
                          onClick={() => follow()}
                          className="btn btn-primary"
                        >
                          {isFollow ? "Unfollow" : "Follow Back"}
                        </button>
                      )}
                    </span>
                  )}

                <span>
                  {myself &&
                    myself._id &&
                    user &&
                    user._id &&
                    user._id !== myself._id &&
                    !myself.isBlocked &&
                    !user.isBlocked && (
                      <a
                        className="btn btn-outline-secondary"
                        onClick={() => openChat(user._id, user.name)}
                      >
                        Message
                      </a>
                    )}
                </span>
                {myself && user && myself._id != user._id && (
                  <div className="dropdown mat-blue">
                    <a
                      role="button"
                      className="material-icons rotate-90 mt-2"
                      id="dropdown-profile-box-btn for tablet view"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      more_vert
                    </a>
                    <ul
                      className="dropdown-menu dropdown-menu-right smAlLPop_up py-0 border-0"
                      aria-labelledby="dropdown-profile-box-btn"
                    >
                      {!user.isBlocked ? (
                        <li>
                          <a
                            onClick={() => blockThisUser()}
                            className="dropdown-item"
                          >
                            <span className="mr-2">
                              <i className="fas fa-ban"></i>
                            </span>
                            Block
                          </a>
                        </li>
                      ) : (
                        <li>
                          <a
                            onClick={() => unblockThisUser()}
                            className="dropdown-item"
                          >
                            <span className="mr-2">
                              <i className="fas fa-ban"></i>
                            </span>
                            Unblock
                          </a>
                        </li>
                      )}
                      <li>
                        <a
                          onClick={() => openReportModal()}
                          className="dropdown-item"
                        >
                          <span className="mr-2">
                            <i className="fas fa-exclamation-circle"></i>
                          </span>
                          Report
                        </a>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="right-box">
                  {services.map((service: any) => {
                    return (
                      <a key={service.id}>
                        <span
                          className={
                            service.type +
                            "_" +
                            service.duration +
                            "_" +
                            service.durationUnit
                          }
                          data-toggle="tooltip"
                          data-placement="top"
                          title={service?.title}
                        ></span>
                      </a>
                    );
                  })}
                </div>
              </div>
              <div className="followers-row">
                <h4 className="followers1 link">
                  <span>{followers ? followers?.length : 0} </span>{" "}
                  <span>
                    {followers && followers.length > 1
                      ? "followers"
                      : "follower"}
                  </span>
                </h4>

                <h4 className="followers1 link">
                  <span>{followings ? followings?.length : 0} </span>{" "}
                  <span>
                    {followings && followings.length > 1
                      ? "followings"
                      : "following"}
                  </span>
                </h4>
              </div>

              <div className="disc-row">
                <p>
                  {user && user.coreBranch} <br /> {user && user.institute}
                </p>
              </div>
              {!myown && mutualFollows && mutualFollows.length && (
                <div className="shaer-box mb-3">
                  <div className="meny-followed link-underline">
                    Mutual
                    <span style={{ color: "black" }}>
                      {mutualFollows.length > 0 &&
                        mutualFollows[0].name.split(" ")[0]}
                    </span>
                    {mutualFollows.length > 1 && (
                      <span style={{ color: "black", marginLeft: 0 }}>
                        ,
                        {mutualFollows.length > 1 &&
                          mutualFollows[1].name.split(" ")[0]}
                      </span>
                    )}
                    {mutualFollows.length > 2 && (
                      <span>
                        {" "}
                        +{" "}
                        {mutualFollows.length > 2
                          ? mutualFollows.length - 2
                          : 0}{" "}
                        more
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="shaer-box">
                {user &&
                  (user.facebook ||
                    user.instagram ||
                    user.linkedIn ||
                    user.youtube) && (
                    <div className="find">
                      <span>Find me on</span>
                      {user.facebook && (
                        <span>
                          <a
                            aria-label="facebook"
                            href={
                              user.facebook.indexOf("https://") > -1
                                ? user.facebook
                                : "https://www.facebook.com/" + user.facebook
                            }
                            target="_blank"
                            className="facebook"
                          >
                            <img
                              src="/assets/images/student-profile/facebook.svg"
                              alt=""
                            />
                          </a>
                        </span>
                      )}
                      {user.instagram && (
                        <span>
                          <a
                            aria-label="Instagram"
                            href={
                              user.instagram.indexOf("https://") > -1
                                ? user.instagram
                                : "https://www.instagram.com/" + user.instagram
                            }
                            target="_blank"
                          >
                            <img
                              src="/assets/images/student-profile/instagram.svg"
                              alt=""
                            />
                          </a>
                        </span>
                      )}
                      {user.linkedIn && (
                        <span>
                          <a
                            aria-label="LinkedIn"
                            href={
                              user.linkedIn.indexOf("https://") > -1
                                ? user.linkedIn
                                : "https://www.linkedin.com/" + user.linkedIn
                            }
                            target="_blank"
                            className="linkedin"
                          >
                            <img
                              src="/assets/images/student-profile/linkedin.svg"
                              alt=""
                            />
                          </a>
                        </span>
                      )}
                      {user.youtube && (
                        <span>
                          <a
                            aria-label="Youtube"
                            href={
                              user.youtube.indexOf("https://") > -1
                                ? user.youtube
                                : "https://www.youtube.com/" + user.youtube
                            }
                            target="_blank"
                            className="youtube"
                          >
                            <i
                              className="fab fa-youtube"
                              style={{ color: "#fe0000", fontSize: 24 }}
                            ></i>
                          </a>
                        </span>
                      )}
                    </div>
                  )}

                <div className="find">
                  <span>Share on </span>
                  <a
                    aria-label="LinkedIn"
                    href={getClientData?.baseUrl + "public/profile/" + userId}
                  >
                    <FontAwesomeIcon icon={faLinkedin} size="2x" />
                  </a>
                  <a
                    aria-label="facebook"
                    href={getClientData?.baseUrl + "public/profile/" + userId}
                  >
                    <FontAwesomeIcon icon={faFacebookSquare} size="2x" />
                  </a>
                  <a
                    aria-label="twitter"
                    href={getClientData?.baseUrl + "public/profile/" + userId}
                  >
                    <FontAwesomeIcon icon={faTwitterSquare} size="2x" />
                  </a>
                  <a
                    aria-label="copy"
                    href={getClientData?.baseUrl + "public/profile/" + userId}
                    onClick={() => notifyCopied()}
                  >
                    <FontAwesomeIcon icon={faCopy} size="2x" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="section-1 section-bodys mobile-view">
            <div className="text-right mt-2">
              {myself && user && myself._id != user._id && (
                <div className="dropdown mat-blue">
                  <a
                    role="button"
                    className="material-icons"
                    id="dropdown-profile-box-btn for mobile view"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    more_vert
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-right smAlLPop_up py-0 border-0"
                    aria-labelledby="dropdown-profile-box-btn"
                  >
                    {!user.isBlocked ? (
                      <li>
                        <a onClick={blockThisUser} className="dropdown-item">
                          <span className="mr-2">
                            <i className="fas fa-ban"></i>
                          </span>
                          Block
                        </a>
                      </li>
                    ) : (
                      <li>
                        <a onClick={unblockThisUser} className="dropdown-item">
                          <span className="mr-2">
                            <i className="fas fa-ban"></i>
                          </span>
                          Unblock
                        </a>
                      </li>
                    )}
                    {/* <li>
                                  <a onClick={reportThisUser} className="dropdown-item">
                                      <span className="mr-2"><i className="fas fa-exclamation-circle"></i></span>Report
                                  </a>
                              </li> */}
                  </ul>
                </div>
              )}
            </div>
            <br />
            <div className="followers-image">
              <div className="image mpro-pic">
                <img
                  src={
                    (user && user.avatarLink) ||
                    "/assets/images/profile-img.png"
                  }
                  alt=""
                />
              </div>
              {/* <div className="followers-row">
                          <div className="nav-item massage-center dropdown notify_type message_center_dropdown_wraper" dropdown (onShown)="fetchFollowers()">
                              <h4 className="item-follow" role="button" id="dropdownMassageCenter" aria-label="for followers" dropdownToggle>
                                  <span className="link">{{followers ? followers.length : 0}} <br> followers</span>
                              </h4>
                              <div className="dropdown-menu vertical-Expand py-8" *dropdownMenu id="dropdown-msg" style="padding: 8px; margin-top: -16px; box-shadow: 0 3px 10px rgb(0 0 0 / 0.3); border: none;">
                                  <div className="heading" style="background: #4C73E6; color: white; padding: 4px 8px; margin-bottom: 8px; border-radius: 2px;">
                                      Followers </div>
                                  <ul *ngIf="followers && followers.length > 0; else thenBlockFollowers">
                                      <li className="follow-list-item" style="margin-bottom: 4px;" *ngFor="let follower of followers">
                                          <div style="display: inline-flex;">
                                              <img [src]="follower |avatar" alt="" style="width: 40px; height: 40px; border-radius: 50%; margin-top: 4px;" />
                                              <div>
                                                  <div style="display: inline-flex; align-items: center;">
                                                      <a href="/public/profile/{{follower.id}}" target="_blank" className="follow-list-item-name">{{follower &&
                                                          follower.id==myself._id ? "You" :
                                                          follower.name.split(' ')[0]}}</a>
                                                      <span style="font-size: 10px; text-transform: capitalize; color: #808080">{{follower.role}}</span>
                                                  </div>
                                                  <div style="font-size:12px; padding-left: 8px; color: #404040">{{follower.coreBranch}}</div>
                                              </div>
                                          </div>
                                          <button className="follow-list-item-action-unfollow" (click)="follow(follower.id, follower.iFollow ? false : true)">{{follower.iFollow ? "Following" :
                                              "Follow"}}</button>
                                      </li>
                                  </ul>
                                  <ng-template #thenBlockFollowers>
                                      <div style="padding:8px; color: #a0a0a0;">No follower</div>
                                  </ng-template>
                              </div>
                          </div>
                          <div className="nav-item massage-center dropdown notify_type message_center_dropdown_wraper" dropdown (onShown)="fetchFollowings()">
                              <h4 className="item-follow" role="button" id="dropdownMassageCenter" aria-label="followings" dropdownToggle>
                                  <span className="link">{{followings ? followings.length : 0}} <br> followings</span>
                              </h4>
                              <div className=" dropdown-menu vertical-Expand py-8" *dropdownMenu id="dropdown-msg" style="padding: 8px; margin-top: -16px; box-shadow: 0 3px 10px rgb(0 0 0 / 0.3); border: none;">
                                  <div className="heading" style="background: #4C73E6; color: white; padding: 4px 8px; margin-bottom: 8px; border-radius: 2px;">
                                      Followings </div>
                                  <ul *ngIf="followings && followings.length > 0; else thenBlockFollowings">
                                      <li className="follow-list-item" style="margin-bottom: 4px;" *ngFor="let following of followings">
                                          <div style="display: inline-flex;">
                                              <img [src]="following|avatar" alt="" style="width: 40px; height: 40px; border-radius: 50%; margin-top: 4px;" />
                                              <div>
                                                  <div style="display: inline-flex; align-items: center;">
                                                      <a href="/public/profile/{{following.id}}" target="_blank" className="follow-list-item-name">{{following &&
                                                          following.id==myself._id ? "You" : following.name.split(' ')[0]}}</a>
                                                      <span style="font-size: 10px; text-transform: capitalize; color: #808080">({{following.role |titlecase}})</span>
                                                  </div>
                                                  <div style="font-size:12px; padding-left: 8px; color: #404040">{{following.coreBranch}}</div>
                                              </div>
                                          </div>
                                          <button (click)="follow(following.id, following.iFollow ? false : true)" className="follow-list-item-action-unfollow">{{following.iFollow ?
                                              "Following" : "Follow"}}</button>
                                      </li>
                                  </ul>
                                  <ng-template #thenBlockFollowings>
                                      <div style="padding:8px; color: #a0a0a0;">No following</div>
                                  </ng-template>
                              </div>
                          </div>
                      </div> */}
            </div>
            <div className="right-content">
              <div className="right-box">
                {services.map((service: any) => (
                  <a key={service.id}>
                    <span
                      className={
                        service.type +
                        "_" +
                        service.duration +
                        "_" +
                        service.durationUnit
                      }
                      data-toggle="tooltip"
                      data-placement="top"
                      title={service.title}
                    ></span>
                  </a>
                ))}
              </div>
              <div className="name-hadding ">
                <h4>{user && user.name}</h4>
                <div className="disc-row">
                  <p>
                    {user && user.coreBranch} <br /> {user && user.institute}
                  </p>
                </div>
                {/* <div className="nav-item massage-center dropdown notify_type message_center_dropdown_wraper" dropdown *ngIf="!myown && mutualFollows && mutualFollows.length">
                              <div className="meny-followed" role="button" id="dropdownMassageCenter" dropdownToggle aria-controls="dropdown-msg"> Mutual
                                  <b>{{mutualFollows[0].name.split(' ')[0]}}</b>
                                  <b *ngIf="mutualFollows.length > 1">, {{mutualFollows.length > 1 && mutualFollows[1].name.split(' ')[0]}} </b>
                                  <span *ngIf="mutualFollows.length > 2"><a href="javascript:void(0);">+ {{mutualFollows.length - 2}} more</a></span>
                              </div>
                              <div className="dropdown-menu vertical-Expand py-8" *dropdownMenu id="dropdown-msg" style="padding: 8px; margin-top: -16px; box-shadow: 0 3px 10px rgb(0 0 0 / 0.3); border: none;">
                                  <div className="heading" style="background: #4C73E6; color: white; padding: 4px 8px; margin-bottom: 8px; border-radius: 2px;">
                                      mutualFollows </div>
                                  <ul *ngIf="mutualFollows && mutualFollows.length > 0; else thenBlockmutualFollows">
                                      <li className="follow-list-item" style="margin-bottom: 4px;" *ngFor="let mutualFollow of mutualFollows">
                                          <div style="display: inline-flex;">
                                              <img [src]="mutualFollow|avatar" alt="" style="width: 40px; height: 40px; border-radius: 50%; margin-top: 4px;" />
                                              <div>
                                                  <div style="display: inline-flex; align-items: center;">
                                                      <a href="/public/profile/{{mutualFollow.id}}" target="_blank" className="follow-list-item-name">{{mutualFollow &&
                                                          mutualFollow.id==myself._id ? "You" : mutualFollow.name.split(' ')[0]}}</a>
                                                      <span style="font-size: 10px; text-transform: capitalize; color: #808080">({{mutualFollow.role |titlecase}})</span>
                                                  </div>
                                                  <div style="font-size:12px; padding-left: 8px; color: #404040">{{mutualFollow.coreBranch}}</div>
                                              </div>
                                          </div>
                                          <button (click)="follow(mutualFollow.id, mutualFollow.iFollow ? false : true)" className="follow-list-item-action-unfollow">{{mutualFollow.iFollow ?
                                              "Following" : "Follow"}}</button>
                                      </li>
                                  </ul>
                                  <ng-template #thenBlockmutualFollows>
                                      <div style="padding:8px; color: #a0a0a0;">Nothing</div>
                                  </ng-template>
                              </div>
                          </div> */}
              </div>
              <div className="shaer-box flex-wrap">
                <div className="d-flex justify-content-center">
                  {user &&
                    myself &&
                    user._id != myself._id &&
                    !myself.isBlocked &&
                    !user.isBlocked && (
                      <span className="mr-2">
                        <button onClick={follow} className="btn btn-primary">
                          {isFollow ? "Unfollow" : "Follow"}
                        </button>
                      </span>
                    )}
                  <span>
                    {myself &&
                      myself._id &&
                      user &&
                      user._id &&
                      user._id !== myself._id &&
                      !myself.isBlocked &&
                      !user.isBlocked && (
                        <a
                          className="btn btn-outline-secondary mr-2"
                          onClick={() => openChat(user._id, user.name)}
                        >
                          Message
                        </a>
                      )}
                  </span>

                  {myself && user && myself._id != user._id && (
                    <div className="dropdown mat-blue d-none">
                      <a
                        role="button"
                        className="material-icons-outlined rotate-90"
                        id="dropdown-profile-box-btn{{i}}"
                        aria-label="dropdown"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        more_vert
                      </a>
                      <ul
                        className="dropdown-menu dropdown-menu-right smAlLPop_up py-0 border-0"
                        aria-labelledby="dropdown-profile-box-btn"
                      >
                        {!user.isBlocked ? (
                          <li>
                            <a
                              onClick={blockThisUser}
                              className="dropdown-item"
                            >
                              <span className="mr-2">
                                <i className="fas fa-ban"></i>
                              </span>
                              Block
                            </a>
                          </li>
                        ) : (
                          <li>
                            <a
                              onClick={unblockThisUser}
                              className="dropdown-item"
                            >
                              <span className="mr-2">
                                <i className="fas fa-ban"></i>
                              </span>
                              Unblock
                            </a>
                          </li>
                        )}
                        {/* <li>
                                            <a onClick={reportThisUser} className="dropdown-item">
                                                <span className="mr-2"><i className="fas fa-exclamation-circle"></i></span>Report
                                            </a>
                                        </li> */}
                      </ul>
                    </div>
                  )}
                </div>
                {user &&
                  (user.facebook ||
                    user.instagram ||
                    user.linkedIn ||
                    user.youtube) && (
                    <div>
                      <div className="mb-2">
                        <span>Find me on</span>
                      </div>
                      <div className="d-flex">
                        {user.facebook && (
                          <span className="mr-2">
                            <a
                              aria-label="facebook"
                              href={
                                user.facebook.indexOf("https://") > -1
                                  ? user.facebook
                                  : "https://www.facebook.com/" + user.facebook
                              }
                              target="_blank"
                              className="facebook"
                            >
                              <img
                                src="/assets/images/student-profile/facebook.svg"
                                alt=""
                              />
                            </a>
                          </span>
                        )}
                        {user.instagram && (
                          <span className="mr-2">
                            <a
                              aria-label="instgram"
                              href={
                                user.instagram.indexOf("https://") > -1
                                  ? user.instagram
                                  : "https://www.instagram.com/" +
                                    user.instagram
                              }
                              target="_blank"
                            >
                              <img
                                src="/assets/images/student-profile/instagram.svg"
                                alt=""
                              />
                            </a>
                          </span>
                        )}
                        {user.linkedIn && (
                          <span className="mr-2">
                            <a
                              aria-label="LinkedIN"
                              href={
                                user.linkedIn.indexOf("https://") > -1
                                  ? user.linkedIn
                                  : "https://www.linkedin.com/" + user.linkedIn
                              }
                              target="_blank"
                              className="linkedin"
                            >
                              <img
                                src="/assets/images/student-profile/linkedin.svg"
                                alt=""
                              />
                            </a>
                          </span>
                        )}
                        {user.youtube && (
                          <span className="mr-2">
                            <a
                              aria-label="Youtube"
                              href={
                                user.youtube.indexOf("https://") > -1
                                  ? user.youtube
                                  : "https://www.youtube.com/" + user.youtube
                              }
                              target="_blank"
                              className="youtube"
                            >
                              <i className="fab fa-youtube fa-2x text-danger"></i>
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div>
                  <div className="mb-2">
                    <span>Share</span>
                  </div>
                  <div>
                    <a
                      aria-label="Link_linkedin"
                      href={getClientData?.baseUrl + "public/profile/" + userId}
                    >
                      <i className="fab fa-linkedin fa-2x mr-2"></i>
                    </a>
                    <a
                      aria-label="Link_facebook"
                      href={getClientData?.baseUrl + "public/profile/" + userId}
                    >
                      <i className="fab fa-facebook-square fa-2x mr-2"></i>
                    </a>
                    <a
                      aria-label="Link_twitter"
                      href={getClientData?.baseUrl + "public/profile/" + userId}
                    >
                      <i className="fab fa-twitter-square fa-2x mr-2"></i>
                    </a>
                    <a
                      aria-label="Link_copy"
                      href={getClientData?.baseUrl + "public/profile/" + userId}
                      onClick={notifyCopied}
                    >
                      <i className="far fa-copy fa-2x"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-2 ">
            <div className="know-body">
              <div
                className="left-cart"
                style={{ background: "transparent", padding: "0px 0px" }}
              >
                <div className="Knowme_box">
                  <div className="d-flex justify-content-between">
                    <h3>Know me</h3>
                    <p>
                      Member Since:{" "}
                      {user && new Date(user.createdAt).toDateString()}
                    </p>
                  </div>
                  {user?.knowAboutUs && (
                    <p style={{ minHeight: 200 }} className="mob-height">
                      {user && user.knowAboutUs}
                    </p>
                  )}
                  {!user?.knowAboutUs && (
                    <img
                      className="text-center mx-auto mt-4"
                      src="/assets/images/image-1.png"
                      alt=""
                      style={{ height: 180 }}
                    ></img>
                  )}
                  {user && user.role == "mentor" && (
                    <div className="text-center">
                      {/* <circle-progress [percent]="totalMentoring" [radius]="2" [toFixed]="2" [showTitle]="true" [showUnits]="false" [outerStrokeWidth]="0.3" [innerStrokeWidth]="0.1" [title]="totalMentoring" [showSubtitle]="true" [subtitle]="'students'" [responsive]="true"
                                        [titleFontSize]="0.5" [subtitleFontSize]="0.5" [titleFontWeight]="2" [space]="0" [animation]="true" [animationDuration]="300" [startFromZero]="true">
                                    </circle-progress> */}
                      <h1 className="text-center mb-5">Currently Mentoring</h1>
                    </div>
                  )}
                </div>
                <div className="Academics_box" style={{ minHeight: 200 }}>
                  <h1>Academics</h1>
                  {user && user.subjects && user.subjects.length && (
                    <div className="box">
                      <h1
                        style={{
                          position: "relative",
                          color: "#575757",
                          fontSize: "1rem",
                        }}
                      >
                        My Subjects
                      </h1>
                      {user && user.subjects && (
                        <ul>
                          {user.subjects.map((subject: any) => (
                            <li key={subject.name}>
                              <a>{subject.name}</a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {user &&
                    user.specialization &&
                    user.specialization.length > 0 && (
                      <div className="box">
                        <h1
                          style={{
                            position: "relative",
                            color: "#575757",
                            fontSize: "1rem",
                          }}
                        >
                          My Specialization
                        </h1>
                        {user && user.specialization && (
                          <ul>
                            {user.specialization.map(
                              (spec: any, index: number) => (
                                <li key={index}>
                                  <a>{spec}</a>
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                  {!user?.specialization?.length && !user?.subjects?.length && (
                    <img
                      className="text-center mx-auto mt-4"
                      src="/assets/images/image-1.png"
                      alt=""
                      style={{ height: 180 }}
                    ></img>
                  )}
                </div>
              </div>
              <div
                className="right-cart"
                style={{ padding: "0px 0px", borderRadius: 10 }}
              >
                <div className="tabs_student">
                  <div className="tabset">
                    {myself?._id !== user?._id && (
                      <input
                        type="radio"
                        name="tabset"
                        id="tab1"
                        aria-controls="Mutuals"
                        checked={myself?._id !== user?._id}
                      />
                    )}
                    {myself?._id !== user?._id && (
                      <label htmlFor="tab1">Mutuals</label>
                    )}

                    <input
                      type="radio"
                      name="tabset"
                      id="tab2"
                      aria-controls="Followers"
                      checked={myself?._id == user?._id}
                    />
                    <label htmlFor="tab2">Following</label>

                    <input
                      type="radio"
                      name="tabset"
                      id="tab3"
                      aria-controls="Following"
                    />
                    <label htmlFor="tab3">Followers</label>

                    <div className="tab-panels">
                      {myself?._id !== user?._id && (
                        <section id="Mutuals" className="tab-panel">
                          {mutualFollows?.length && (
                            <div>
                              {mutualFollows.map((mutual: any) => (
                                <div className="cont_flex350" key={mutual.id}>
                                  <div className="set_lft_cont56">
                                    <img
                                      className="set_follod_70"
                                      src={mutual}
                                      alt=""
                                    />
                                    <div className="set_in_890">
                                      <a
                                        className="text-dark"
                                        href={`/public/profile/${mutual.id}`}
                                      >
                                        <h4>
                                          {mutual && mutual.id == myself._id
                                            ? "You"
                                            : mutual.name.split(" ")[0]}{" "}
                                          <span>({mutual?.role})</span>
                                        </h4>
                                        <p>{mutual.coreBranch}</p>
                                      </a>
                                    </div>
                                  </div>
                                  <div className="set_rgt_cont57">
                                    <a
                                      className={
                                        mutual.iFollow
                                          ? `btn following_bttn`
                                          : "btn followed_bttn"
                                      }
                                      onClick={() =>
                                        follow(
                                          mutual.id,
                                          mutual?.iFollow ? false : true
                                        )
                                      }
                                    >
                                      {mutual?.iFollow ? "Following" : "Follow"}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {(!mutualFollows || !mutualFollows.length) && (
                            <div className="text-center mt-5">
                              <img
                                style={{ height: 300 }}
                                src="/assets/images/noMutual.svg"
                                className="d-inline-block"
                                alt="noMutual"
                              />
                              <h1 className="bold">No Mutuals Yet</h1>
                              <p>You both have no common friends</p>
                            </div>
                          )}
                        </section>
                      )}

                      <section id="Following" className="tab-panel">
                        {followings?.length > 0 && (
                          <div>
                            {followings.map((following: any) => (
                              <div className="cont_flex350" key={following.id}>
                                <div className="set_lft_cont56">
                                  <img
                                    className="set_follod_70"
                                    src={following}
                                    alt=""
                                  />
                                  <div className="set_in_890">
                                    <a
                                      className="text-dark"
                                      href={`/public/profile/${following.id}`}
                                    >
                                      <h4>
                                        {following && following.id == myself._id
                                          ? "You"
                                          : following.name.split(" ")[0]}{" "}
                                        <span>{following?.role}</span>
                                      </h4>
                                      <p>{following.coreBranch}</p>
                                    </a>
                                  </div>
                                </div>
                                {following.id !== myself._id &&
                                  userId !== myself._id && (
                                    <div className="set_rgt_cont57">
                                      <a
                                        className={
                                          following.iFollow
                                            ? `btn following_bttn`
                                            : "btn followed_bttn"
                                        }
                                        onClick={() =>
                                          follow(
                                            following.id,
                                            following?.iFollow ? false : true
                                          )
                                        }
                                      >
                                        {following?.iFollow
                                          ? "Following"
                                          : "Follow"}
                                      </a>
                                    </div>
                                  )}
                                {following.id !== myself._id &&
                                  userId === myself._id && (
                                    <div className="set_rgt_cont57">
                                      <a
                                        className={
                                          following.iFollow
                                            ? `btn following_bttn`
                                            : "btn followed_bttn"
                                        }
                                        onClick={() => unfollowCall(following)}
                                      >
                                        {following?.iFollow
                                          ? "Following"
                                          : "Follow"}
                                      </a>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                        {!followings ||
                          (followings?.length == 0 && (
                            <div className="text-center mt-5">
                              <img
                                style={{ height: 300 }}
                                src="/assets/images/noFollowing.svg"
                                className="d-inline-block"
                                alt="noFollowing"
                              />
                              <h1 className="bold mt-2">No Following Yet</h1>
                              <p>
                                {myself && userId !== myself._id
                                  ? "They"
                                  : "You"}{" "}
                                are not following anyone
                              </p>
                            </div>
                          ))}
                      </section>

                      <section id="Followers" className="tab-panel">
                        {followers?.length && (
                          <div>
                            {followers.map((follower: any) => (
                              <div className="cont_flex350" key={follower.id}>
                                <div className="set_lft_cont56">
                                  <img
                                    className="set_follod_70"
                                    src={follower}
                                    alt=""
                                  />
                                  <div className="set_in_890">
                                    <a
                                      className="text-dark"
                                      href={`/public/profile/${follower.id}`}
                                    >
                                      <h4>
                                        {follower && follower.id == myself._id
                                          ? "You"
                                          : follower.name.split(" ")[0]}{" "}
                                        <span>({follower?.role})</span>
                                      </h4>
                                      <p>{follower.coreBranch}</p>
                                    </a>
                                  </div>
                                </div>
                                {follower.id !== myself._id &&
                                  userId === myself._id && (
                                    <div className="set_rgt_cont57">
                                      <a
                                        className="btn following_bttn"
                                        onClick={() => remove(follower, "")}
                                      >
                                        Remove
                                      </a>
                                    </div>
                                  )}
                                {follower.id !== myself._id &&
                                  userId !== myself._id && (
                                    <div className="set_rgt_cont57">
                                      <a
                                        className={
                                          follower.iFollow
                                            ? `btn following_bttn`
                                            : "btn followed_bttn"
                                        }
                                        onClick={() =>
                                          follow(
                                            follower.id,
                                            follower?.iFollow ? false : true
                                          )
                                        }
                                      >
                                        {follower?.iFollow
                                          ? "Following"
                                          : "Follow"}
                                      </a>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                        {(!followers || !followers.length) && (
                          <div className="text-center mt-5">
                            <img
                              style={{ height: 300 }}
                              src="/assets/images/noFollower.svg"
                              className="d-inline-block"
                              alt="noFollower"
                            />
                            <h4 className="bold mt-2">No Followers Yet</h4>
                            <p>
                              No one is following{" "}
                              {myself && userId !== myself._id ? "them" : "you"}{" "}
                              right now
                            </p>
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {user && user.role == "student" && (
            <div className="section-4 section-bodys">
              <h1 className="hadding-name-a">Certificate Achieved</h1>
              <div className="certificates-achieved">
                {!certificates ||
                  (!certificates.length && (
                    <div className="certificates-empty-body">
                      <div className="image">
                        <img
                          src="/assets/images/image-1.png"
                          alt=""
                          style={{ height: 200 }}
                        />
                      </div>
                      <div className="content mt-2">
                        <p>You didn’t achieved any certificate yet</p>
                      </div>
                    </div>
                  ))}
                {certificates && certificates.length > 0 && (
                  <div className="certificates-achieved-body">
                    {certificates.map((certi: any, i: any) => (
                      <div className="certificates-cart" key={i}>
                        <div className="left-content">
                          {i % 2 == 0 && (
                            <div className="image">
                              <img src="/assets/images/image1.svg" alt="" />
                            </div>
                          )}
                          {i % 2 !== 0 && (
                            <div className="image">
                              <img src="/assets/images/image2.svg" alt="" />
                            </div>
                          )}
                          <div className="content">
                            <h1>CERTIFICATE</h1>
                            <h1>{certi?.course?.title}</h1>
                            <h1>Completed on {certi?.issuedCertificateDate}</h1>
                          </div>
                        </div>
                        <div className="download">
                          <a
                            onClick={() => download(certi)}
                            className="download-link"
                          >
                            <img src="/assets/images/download.svg" alt="" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {user && user.role == "student" && (
            <div className="section-5 section-bodys">
              <h1 className="hadding-name-a">Courses Enrolled</h1>
              <div className="certificates-achieved">
                {!enrolledCourses ||
                  (!enrolledCourses.length && (
                    <div className="certificates-empty-body">
                      <div className="image mx-auto">
                        <img
                          src="/assets/images/image-1.png"
                          alt=""
                          style={{ height: 200 }}
                        />
                      </div>
                      <div className="content mt-2">
                        <p>You didn’t enrolled for any course yet</p>
                      </div>
                    </div>
                  ))}
              </div>
              {enrolledCourses && enrolledCourses.length > 0 && (
                <div className="courses-enrolled">
                  {enrolledCourses.map((course: any) => (
                    <a
                      className="cart-enrolled"
                      onClick={() => navigateCourse(course.course)}
                      key={course.course.id}
                    >
                      <div className="image text-center">
                        <img
                          className="text-center"
                          src="/assets/images/student-profile/image-a.png"
                          alt=""
                        />
                      </div>
                      <div className="disc">
                        <h2>
                          <a
                            href="javascript:void(0);"
                            className="student-coursesenrolled"
                            title="Java Forever v2"
                          >
                            {course.course && course.course.title}
                          </a>
                        </h2>
                        <p>{course.course && course.course.subjects[0].name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {user &&
          user.role == "teacher" &&
          offerCourses &&
          offerCourses.length ? (
            <div className="section-5 section-bodys">
              <h2 className="hadding-name-a">Courses I offer</h2>
              {offerCourses && offerCourses.length && (
                <div className="courses-enrolled">
                  {offerCourses.map((course: any) => (
                    <div className="cart-enrolled" key={course.id}>
                      <div className="image">
                        <img
                          src="/assets/images/student-profile/image-a.png"
                          alt=""
                        />
                      </div>
                      <div className="disc">
                        <h2>
                          <a title={course.title}>{course.title}</a>
                        </h2>
                        {course &&
                          course.subjects &&
                          course.subjects.length > 0 && (
                            <p>
                              {course.subjects[0].name}
                              {course &&
                                course.subjects &&
                                course.subjects.length > 1 && (
                                  <span>
                                    {" "}
                                    + {course.subjects.length - 1} more
                                  </span>
                                )}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="certificates-achieved">
                {!offerCourses ||
                  (!offerCourses.length && (
                    <div className="certificates-empty-body mx-auto">
                      <div className="image mx-auto">
                        <img
                          src="/assets/images/image-1.png"
                          alt=""
                          style={{ height: 200 }}
                        />
                      </div>
                      <div className="content mt-2">
                        <p>You didn’t enrolled for any course yet</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </section>
    </div>
  );
};
export default ProfileBasic;
