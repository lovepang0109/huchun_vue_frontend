"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import clientApi, { getClientDataFunc } from "@/lib/clientApi";
import { confirm } from "alertifyjs";
import alertify from "alertifyjs";
import PImageComponent from "@/components/AppImage";
import ItemPrice from "@/components/ItemPrice";
import {
  addItem,
  saveItems,
  getItems,
  getTotalPrice,
  clearItems,
  reloadItems,
} from "@/services/shopping-cart-service";
import { toQueryString } from "@/lib/validator";

import RatingComponent from "@/components/rating";

const Cart = () => {
  const user: any = useSession()?.data?.user?.info || {};
  const { push, back } = useRouter();

  const [payment, setpayment]: any = useState({
    merchant_id: "108196",
    amount: 0,
    billing_name: "",
    card_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv_number: "",
    card_number: "",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billingCountryCode: {
      code: "",
      name: "",
      callingCodes: [],
    },
    billing_zip: "",
    totalPayment: 0,
    discountData: [],
    couponIds: [],
    referralData: {
      amount: 0,
      settlementDate: new Date(),
      userId: "",
      status: "success",
    },
  });

  const [encRequest, setencRequest]: any = useState(null);
  const [items, setitems]: any = useState(null);
  const [discountAmount, setDiscountAmount]: any = useState(0);
  const [discountData, setdiscountData]: any = useState(null);
  const [hasWarningCouponAll, sethasWarningCouponAll]: any = useState(false);
  const [accessCode, setaccessCode]: any = useState();
  const [newPaypalPayment, setnewPaypalPayment]: any = useState();
  const [canCheckout, setcanCheckout]: any = useState();
  const [warningCoupon, setwarningCoupon]: any = useState();
  const [couponIds, setcouponIds]: any = useState();
  const [page, setpage]: any = useState({
    couponCode: "",
    disabled: false,
    redirect: false,
  });

  const [error, setError] = useState({
    emptyCoupon: false,
    coupon: false,
  });

  const [practices, setPractices] = useState([]);
  const [coupon, setcoupon] = useState(null);
  const [checkout, setcheckout] = useState(false);
  const [paymentUrl, setpaymentUrl] = useState();
  const [paymentMethods, setpaymentMethods]: any = useState();
  const [currency, setcurrency] = useState();
  const [payPalConfig, setpayPalConfig] = useState();
  const [showSuccess, setshowSuccess] = useState();
  const [buyItems, setbuyItems] = useState([]);
  const [bestSellers, setbestSellers] = useState([]);
  const [isProduction, setisProduction] = useState(false);
  const [selectedMethod, setselectedMethod]: any = useState();
  const [digitsInfo, setdigitsInfo] = useState("1.2-2");
  const [settings, setsettings] = useState();
  const [availableCoupons, setavailableCoupons] = useState([]);
  const [canGetMore, setcanGetMore] = useState(false);
  const [countryCode, setcountryCode] = useState("");
  //const [payment, setPayment] = useState({});
  //const [accessCode, setAccessCode] = useState("");
  //const [encRequest, setEncRequest] = useState("");
  //const [newPaypalPayment, setNewPaypalPayment] = useState({});
  //const [canCheckout, setCanCheckout] = useState(false);

  //const formRef = useRef(null);
  //const history = useHistory();

  const selectCoupon = (coupon: any) => {
    setpage((prevPage: any) => ({
      ...prevPage,
      couponCode: coupon.code,
    }));
  };

  const loadMoreCoupons = () => {
    // Uncomment this code and adjust it based on your actual API or data fetching logic
    // this.couponService.findAvailable({
    //   skip: availableCoupons.length,
    //   limit: 10,
    //   items: items.map((i) => i._id),
    // }).subscribe((items: any[]) => {
    //   setAvailableCoupons((prevCoupons) => [...prevCoupons, ...items]);
    //   setCanGetMore(items.length === 10);
    // });
  };

  const removeItem = async (course: any) => {
    const items = getItems();
    let resultitem: any[] = [];
    try {
      items.map((item: any) => {
        if (item._id != course._id) {
          resultitem.push(item);
        }
      });
      if (resultitem.length == 0) setitems(null);
      else setitems(resultitem);
      console.log(resultitem, "result>>>>");
      saveItems(resultitem);
      alertify.success(
        `<i class="fa fa-check" aria-hidden="true"></i>&nbsp;"${course.title}" was Removed`
      );
    } catch (ex: any) {
      alertify.error(ex.message);
    }
  };

  const round10 = (value, exp) => decimalAdjust("round", value, exp);

  function decimalAdjust(type, value, exp) {
    type = String(type);
    if (!["round", "floor", "ceil"].includes(type)) {
      throw new TypeError(
        "The type of decimal adjustment must be one of 'round', 'floor', or 'ceil'."
      );
    }
    exp = Number(exp);
    value = Number(value);
    if (exp % 1 !== 0 || Number.isNaN(value)) {
      return NaN;
    } else if (exp === 0) {
      return Math[type](value);
    }
    const [magnitude, exponent = 0] = value.toString().split("e");
    const adjustedValue = Math[type](`${magnitude}e${exponent - exp}`);
    // Shift back
    const [newMagnitude, newExponent = 0] = adjustedValue.toString().split("e");
    return Number(`${newMagnitude}e${+newExponent + exp}`);
  }

  const calculateDiscountMulti = () => {
    let discount = 0;
    const discountData = payment.discountData;
    if (discountData && discountData.length > 0) {
      // tslint:disable-next-line: forin
      for (const i in discountData) {
        discount += caculateDiscountEachItem(discountData[i]);
      }
    } else {
      reloadItems();
    }

    return discount;
  };

  const caculateDiscountAmount = (discount: any, price: any) => {
    let discountAmount = 0;
    if (discount.discountType === "percent") {
      discountAmount = Number((price * discount.percent) / 100);
    } else {
      discountAmount = Number(discount.price);
    }
    if (price < discountAmount) {
      discountAmount = price;
    }
    return discountAmount;
  };

  const caculateDiscountEachItem = (discount?: any) => {
    const warningCoupon = [];

    let discountAmount = 0;
    const items = getItems();
    let count = 0;
    // tslint:disable-next-line: forin
    for (const i in items) {
      count++;
      const item = items[i];
      // price to apply coupon should be the discounted price
      const price = item.discountValue
        ? item.price - (item.discountValue / 100) * item.price
        : item.price;
      if (!discount) {
        if (item.discountData) {
          delete item.discountData;
        }
      } else if (discount.itemIds && discount.itemIds.length > 0) {
        if (discount.itemIds.indexOf(item._id) === -1) {
          if (item.discountData) {
            delete item.discountData;
          }
          warningCoupon.push(item.title);
        } else {
          item.discountData = {};
          item.discountData.hasDiscount = true;
          const discountPrice = Number(caculateDiscountAmount(discount, price));
          // tslint:disable-next-line:no-var-keyword
          const afterDiscount = price - discountPrice;
          item.discountData.couponName = discount.code;
          item.discountData.discountAmount = discountPrice;
          if (afterDiscount < 0) {
            item.discountData.totalPayment = 0;
          } else {
            item.discountData.totalPayment = afterDiscount;
          }
          discountAmount += discountPrice;
        }
      } else {
        item.discountData = {};
        item.discountData.hasDiscount = true;
        const discountPrice = caculateDiscountAmount(discount, price);
        const afterDiscount = price - discountPrice;
        item.discountData.couponName = discount.code;
        item.discountData.discountAmount = discountPrice;
        if (afterDiscount < 0) {
          item.discountData.totalPayment = 0;
        } else {
          item.discountData.totalPayment = afterDiscount;
        }
        discountAmount += discountPrice;
      }
    }
    if (warningCoupon.length > 0 && count === warningCoupon.length) {
      sethasWarningCouponAll(true);
      setpayment({
        ...payment,
        discountData: [],
      });
      setwarningCoupon(warningCoupon.join(", "));
    }
    return discountAmount;
  };

  const applyCoupon = async () => {
    if (!page.couponCode || !page.couponCode.trim()) {
      error.emptyCoupon = true;
      if (payment.discountData) {
        delete payment.discountData;
        setpayment(payment);
      }
      caculateDiscountEachItem();
      setdiscountData(null);
      setDiscountAmount(0);

      setpayment({
        ...payment,
        totalPayment: getTotalPrice(user, countryCode),
      });
      setpayment({
        ...payment,
        totalPayment: getTotalPrice(user, countryCode),
      });
      return;
    } else {
      setError({
        ...error,
        emptyCoupon: false,
      });
    }
    setwarningCoupon(null);
    sethasWarningCouponAll(false);

    // this.couponService.findOne(this.page.couponCode).subscribe((result: any) => {
    //   this.payment.discountData = [];
    //   this.payment.couponIds = [];
    //   this.error.coupon = false;

    //   const amount = this.shoppingCartService.getTotalPrice();
    //   if (result.isReferral) {
    //     this.discountData = result;
    //     this.discountAmount = amount * result.percent / 100
    //     if (this.user.country.currency == 'INR') {
    //       this.discountAmount = Math.round(this.discountAmount)
    //     }
    //     if (!this.hasWarningCouponAll) {
    //       this.payment.discountData.push(result);
    //       this.payment.hasDiscount = true;
    //       this.payment.discountValue = this.discountAmount;
    //       this.payment.couponIds.push(result._id);
    //       this.payment.referralData.userId = this.page.couponCode;
    //       this.payment.referralData.amount = this.discountAmount;

    //       if (this.discountAmount > amount) {
    //         this.payment.totalPayment = 0;
    //       } else {
    //         this.payment.totalPayment = amount - this.discountAmount;
    //       }
    //     }
    //   } else {
    //     this.discountData = result;
    //     this.discountAmount = this.caculateDiscountEachItem(result);
    //     if (this.user.country.currency == 'INR') {
    //       this.discountAmount = Math.round(this.discountAmount)
    //     }
    //     if (!this.hasWarningCouponAll) {
    //       this.payment.discountData.push(result);
    //       this.payment.hasDiscount = true;
    //       this.payment.discountValue = this.discountAmount;
    //       this.payment.couponIds.push(result._id);
    //       if (this.discountAmount > amount) {
    //         this.payment.totalPayment = 0;
    //       } else {
    //         this.payment.totalPayment = amount - this.discountAmount;
    //       }
    //       alertify.success('Coupon Successfully applied!!')
    //     }
    //   }

    // }, (err) => {
    //   if (this.payment.discountData) {
    //     delete this.payment.discountData;
    //   }
    //   this.caculateDiscountEachItem();
    //   this.discountData = null;
    //   this.discountAmount = 0;
    //   this.payment.totalPayment = this.shoppingCartService.getTotalPrice();
    //   this.error.coupon = true;
    // });
  };

  const removeCoupon = ($index: any) => {
    confirm("Are you sure you want to delete this coupon?", (success: any) => {
      setpayment({
        ...payment,
        discountData: payment.discountData.splice($index, 1),
        couponIds: payment.couponIds.splice($index, 1),
      });
      setDiscountAmount(calculateDiscountMulti());

      if (user.country.currency == "INR") {
        setDiscountAmount(Math.round(discountAmount));
      }
      setwarningCoupon(null);
      setpage({
        ...page,
        couponCode: "",
      });

      if (discountAmount > payment.amount) {
        setpayment({
          ...payment,
          totalPayment: 0,
        });
      } else {
        setpayment({
          ...payment,
          totalPayment: payment.amount - discountAmount,
        });
      }
      success("Coupon removed successfully.");
    });
  };

  {
    /*
    const completePayment = async () => {
      if (!selectedMethod) {
        return;
      }
      setpayment({
        ...payment,
        currency,
        paymentMethod: selectedMethod.name,
      });
      const paypost = {
        payment: {
          ...payment,
          currency,
          paymentMethod: selectedMethod.name,
        },
        amount: payment.amount,
        orderDetail: items,
        paymentMethod: selectedMethod.name,
      };
      console.log(paypost, "paypost");
      clearItems();
      window.location.reload();
      const { data } = await clientApi.post(
        `/api/payments/createPayment`,
        paypost
      );
      console.log("success>>>>");
      if (selectedMethod.name === "ccavenue" && data.accessCode) {
        setaccessCode(data.accessCode);
        setencRequest(data.encRequest);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else if (
        selectedMethod.name === "paypal" &&
        data._id &&
        data.status !== "success"
      ) {
        setTimeout(() => {
          setnewPaypalPayment(data);
          setcanCheckout(true);
          initPaypal();
        }, 100);
      } else if (
        selectedMethod.name === "razorpay" &&
        data._id &&
        data.status !== "success"
      ) {
        const options = {
          key: selectedMethod.keyId, // Enter the Key ID generated from the Dashboard
          amount: data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency: currency,
          name: user.name,
          description: "Transaction",
          image: settings.emailLogo,
          order_id: data.orderId,
          handler: (response: any) => {
            //alert("Message",response.razorpay_payment_id);
            //alert("Message",response.razorpay_order_id);
            //alert("Message",response.razorpay_signature);
            clientApi
              .post(`payments/finishPayment/${data._id}`, response)
              .then((d: any) => {
                push(`/result-payment/${data._id}`);
              })
              .catch((err: any) => {
                console.log(err);
              });
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phoneNumber,
          },
          notes: {},
          theme: {
            color: "#3399cc",
          },
          method: {
            netbanking: true,
            card: true,
            wallet: true,
            upi: false,
            paylater: false,
          },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          alertify.alert("Message",
            "Fail to process your payment",
            response.error.description
          );
          //alert("Message",response.error.code);
          //alert("Message",response.error.description);
          //alert("Message",response.error.source);
          //alert("Message",response.error.step);
          //alert("Message",response.error.reason);
          //alert("Message",response.error.metadata.order_id);
          //alert("Message",response.error.metadata.payment_id);
        });

        rzp1.open();
        clearItems();
        window.location.reload();
      } else if (data._id) {
        //page.redirect = true;
        push(`/result-payment/${data._id}`);
      }

      ///////
      const { data } = await clientApi.post(`/api/payments/createPayment`, paypost);
      console.log("success>>>>")
      if (selectedMethod.name === 'ccavenue' && data.accessCode) {
        setaccessCode(data.accessCode)
        setencRequest(data.encRequest)
        setTimeout(() => {
          window.location.reload()
        }, 100);
      } else if (selectedMethod.name === 'paypal' && data._id && data.status !== 'success') {
        setTimeout(() => {
          setnewPaypalPayment(data);
          setcanCheckout(true);
          initPaypal()
        }, 100);
      } else if (selectedMethod.name === 'razorpay' && data._id && data.status !== 'success') {

        const options = {
          "key": selectedMethod.keyId, // Enter the Key ID generated from the Dashboard
          "amount": data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          "currency": currency,
          "name": user.name,
          "description": "Transaction",
          //     "image": settings.emailLogo,
          "order_id": data.orderId,
          "handler": (response: any) => {
            // alert("Message",response.razorpay_payment_id);
            // alert("Message",response.razorpay_order_id);
            // alert("Message",response.razorpay_signature)
            clientApi.post(`payments/finishPayment/${data._id}`, response).then((d: any) => {
              push(`/result-payment/${data._id}`)
            }).catch((err: any) => {
              console.log(err);
            })
          },
          "prefill": {
            "name": user.name,
            "email": user.email,
            "contact": user.phoneNumber
          },
          "notes": {},
          "theme": {
            "color": "#3399cc"
          },
          // method: {
          //   netbanking: true,
          //   card: true,
          //   wallet: true,
          //   upi: false,
          //   paylater: false
          // }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          alert("Message",'Fail to process your payment: ' + response.error.description);
        });
        rzp1.open();
    

    

        // rzp1.open();
        clearItems()
        window.location.reload()
      } else if (data._id) {
        // this.page.redirect = true;
        push(`/result-payment/${data._id}`);
      }

      this.paymentService.createPayment(this.payment, this.shoppingCartService.items, this.selectedMethod.name).subscribe((data: any) => {
        if (this.selectedMethod.name === 'ccavenue' && data.accessCode) {

          this.accessCode = data.accessCode;
          this.encRequest = data.encRequest;
          setTimeout(() => {
            this.page.redirect = true;
            this.form.nativeElement.submit();
          }, 100);
        } else if (this.selectedMethod.name === 'paypal' && data._id && data.status !== 'success') {
          setTimeout(() => {
            this.newPaypalPayment = data;
            this.canCheckout = true;
            this.initPaypal();
          }, 100);
        } else if (this.selectedMethod.name === 'razorpay' && data._id && data.status !== 'success') {
          const options = {
            "key": this.selectedMethod.keyId, // Enter the Key ID generated from the Dashboard
            "amount": data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": this.currency,
            "name": this.user.name,
            "description": "Transaction",
            "image": this.settings.emailLogo,
            "order_id": data.orderId,
            "handler": (response) => {
              // alert("Message",response.razorpay_payment_id);
              // alert("Message",response.razorpay_order_id);
              // alert("Message",response.razorpay_signature)
              this.paymentService.finishPayment(data._id, response).subscribe((d) => {
                this.router.navigate(['/result-payment', data._id]);
              }, (err) => {
                console.log(err);
              });
            },
            "prefill": {
              "name": this.user.name,
              "email": this.user.email,
              "contact": this.user.phoneNumber
            },
            "notes": {},
            "theme": {
              "color": "#3399cc"
            },
            // method: {
            //   netbanking: true,
            //   card: true,
            //   wallet: true,
            //   upi: false,
            //   paylater: false
            // }
          };
          const rzp1 = new window.Razorpay(options);
          rzp1.on('payment.failed', function (response) {
            alertify.alert("Message",'Fail to process your payment', response.error.description)
            // alert("Message",response.error.code);
            // alert("Message",response.error.description);
            // alert("Message",response.error.source);
            // alert("Message",response.error.step);
            // alert("Message",response.error.reason);
            // alert("Message",response.error.metadata.order_id);
            // alert("Message",response.error.metadata.payment_id);
          });

          rzp1.open();
        } else if (data._id) {
          // this.page.redirect = true;
          this.router.navigate(['/result-payment', data._id]);
        }
      }, (errs) => {
        this.page.disabled = false;
        this.page.redirect = false;
        const str = [];
        if (typeof errs.error === 'object' && errs.error.message) {
          alertify.alert("Message",errs.error.message);
          return;
        }
        // tslint:disable-next-line:forin
        for (const i in errs.error) {
          if (errs.error[i].message) {
            str.push(errs.error[i].message);
          }
          if (errs.error[i].msg) {
            str.push(errs.error[i].msg);
          }
        }
        if (str.length > 0) {
          alertify.alert("Message",str.join('<br>'));
        }
      }).add(() => this.spinner.hide('appLoader'));
    };
  */
  }
  const clearItems = () => {
    // Implement your clearItems logic
  };

  const finishRazorpayPayment = (paymentId: any, response: any) => {
    // Implement your finishRazorpayPayment logic
  };

  const handleRazorpayPayment = (data: any) => {
    const options = {
      key: selectedMethod.keyId,
      amount: data.amount,
      currency: currency,
      name: user.name,
      description: "Transaction",
      order_id: data.orderId,
      handler: (response: any) => {
        clientApi
          .post(`payments/finishPayment/${data._id}`, response)
          .then((d) => {
            history.push(`/result-payment/${data._id}`);
          })
          .catch((err) => {
            console.log(err);
          });
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phoneNumber,
      },
      notes: {},
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new window.Razorpay(options);

    rzp1.on("payment.failed", function (response: any) {
      alertify.alert(
        "Message",
        "Fail to process your payment",
        response.error.description
      );
    });

    rzp1.open();
  };

  const completePayment = async () => {
    if (!selectedMethod) {
      return;
    }

    setpayment({
      ...payment,
      currency,
      paymentMethod: selectedMethod.name,
    });

    const paypost = {
      payment: {
        ...payment,
        currency,
        paymentMethod: selectedMethod.name,
      },
      amount: payment.amount,
      orderDetail: items,
      paymentMethod: selectedMethod.name,
    };

    console.log(paypost, "paypost");

    clearItems();
    window.location.reload();

    try {
      const { data } = await clientApi.post("/api/payments", paypost);
      console.log("success>>>>");

      if (selectedMethod.name === "ccavenue" && data.accessCode) {
        setaccessCode(data.accessCode);
        setencRequest(data.encRequest);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else if (
        selectedMethod.name === "paypal" &&
        data._id &&
        data.status !== "success"
      ) {
        setTimeout(() => {
          setnewPaypalPayment(data);
          setcanCheckout(true);
          initPaypal();
        }, 100);
      } else if (
        selectedMethod.name === "razorpay" &&
        data._id &&
        data.status !== "success"
      ) {
        handleRazorpayPayment(data);
      } else if (data._id) {
        push(`/result-payment/${data._id}`);
      }
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };

  // paypal
  const initPaypal = () => {
    setpayPalConfig({
      currency: currency,
      clientId: selectedMethod.id,
      // tslint:disable-next-line:no-angle-bracket-type-assertion
      // createOrderOnClient: (data: any) => {
      //   intent: "CAPTURE",
      //     purchase_units: [
      //       {
      //         amount: {
      //           currency_code: currency,
      //           value: newPaypalPayment.totalPayment.toFixed(2),
      //         }
      //       }
      //     ],
      // },
      advanced: {
        commit: "true",
      },
      style: {
        label: "paypal",
        layout: "vertical",
      },
      onApprove: (data: any, actions: any) => {
        actions.order.get().then((details: any) => {});
      },
      onClientAuthorization: (data: any) => {
        setshowSuccess(true);
        clientApi
          .post(`/api/payments/finishPayment/${newPaypalPayment._id}`)
          .then((d: any) => {
            push(`/result-payment/${newPaypalPayment._id}`);
          })
          .catch((err: any) => {
            console.log(err);
          });
        clearItems();
      },
      onCancel: (data: any, actions: any) => {},
      onError: (err: any) => {
        console.log(err);
        let msg = "";
        if (err) {
          try {
            let tmp: string = err.toString();
            tmp = tmp.substring(tmp.indexOf("{"));
            const errjson = JSON.parse(tmp);
            if (errjson && errjson.details) {
              for (const d of errjson.details) {
                if (d.issue == "CURRENCY_NOT_SUPPORTED") {
                  msg = "Currency is not supported.";
                }
              }
            }
          } catch (err) {}
        }
        if (msg) {
          alertify.alert("Message", "Fail to process your payment", msg);
        } else {
          alertify.alert("Message", "Fail to process your payment");
        }
      },
      onClick: (data: any, actions: any) => {},
    });
  };

  const getCourses = () => {
    // const buyCourses = this.courseService.getPopularCourse({ limit: 5, page: 2 });
    // const bestSeller = this.courseService.getPopularCourse({ limit: 5, page: 1 });
    // forkJoin([buyCourses, bestSeller])
    //   .subscribe(([bC, bs]: [any[], any[]]) => {
    //     this.buyItems = bC.map(c => {
    //       c.itemType = 'course'
    //       return c
    //     })
    //     bs.forEach(c => { c.itemType = 'course' })
    //     if (this.items) {
    //       this.bestSellers = bs.filter((bi) => !this.items.find(i => i._id == bi._id) && !this.buyItems.find(b => b._id == bi._id))
    //     }
    //     this.getTestSeries()
    //   }, err => {
    //     console.log(err);
    //   });
  };

  const getRecommendedTestSeries = () => {
    // this.testSeriesSvc.recommendedTestSeries({ limit: 5, cart: true, excludeEnrolled: true }).subscribe((res: any[]) => {
    //   this.bestSellers = this.bestSellers.concat(res.map(c => {
    //     c.itemType = 'testseries'
    //     return c
    //   }))
    //   if (this.items) {
    //     this.bestSellers = this.bestSellers.filter((element) => !this.items.find(i => i._id == element._id) && !this.buyItems.find(b => b._id == element._id))
    //   }
    // })
  };

  const getTestSeries = () => {
    // this.testSeriesSvc.boughtTestSeriesByOthers({ limit: 5, excludeEnrolled: true }).subscribe((d: any[]) => {
    //   this.buyItems = this.buyItems.concat(d.map(c => {
    //     c.itemType = 'testseries'
    //     return c
    //   }));
    //   if (this.items) {
    //     this.buyItems = this.buyItems.filter((element) => !this.items.find(i => i._id == element._id))
    //   }
    //   this.getRecommendedTestSeries()
    // });
  };

  const addToCart = (item: any) => {
    let arrayIndex = -1;
    arrayIndex = bestSellers.findIndex((r: any) => r._id == item._id);
    if (arrayIndex == -1) {
      arrayIndex = buyItems.findIndex((r: any) => r._id == item._id);
      if (arrayIndex > -1) {
        buyItems.splice(arrayIndex, 1);
        setbuyItems(buyItems);
      }
    } else {
      bestSellers.splice(arrayIndex, 1);
      setbestSellers(bestSellers);
    }

    addItem(item, 1, item.itemType);
  };

  const viewDetails = (item: any) => {
    if (item.itemType == "testseries") {
      push(`/student/testSeries/details${item._id}`);
    } else if (item.itemType == "course") {
      push(`/student/course/details${item._id}`);
    }
  };

  const getTitle = (arr: any) => {
    arr = arr.map((e: any) => e.name);
    return arr.slice(1).join(",");
  };

  const getContentCount = (items: any) => {
    if (items) {
      const titems = items;
      titems.forEach(async (e: any) => {
        if (e.typeItem == "course" || e.type == "other") {
          let count = 0;
          if (e.sections && e.sections.length > 0) {
            e.sections.forEach((s: any) => {
              count += s.contents.length;
            });
          }
          e.contentCount = count;
        } else if (e.typeItem == "testseries") {
          let testSeriesItem = await clientApi.get(
            `api/tests/testBySubject/${e._id}`
          );
          e.contentCount = e?.practiceIds?.length | testSeriesItem.data.length;
        }
      });
      return titems;
    }
    return undefined;
  };

  const startFunc = async () => {
    const clientData = await getClientDataFunc();
    setsettings(clientData);
    let paymentMethodsResult = await clientApi.get(
      `/api/settings/paymentMethods`
    );

    setpaymentMethods(paymentMethodsResult.data.methods);
    setcurrency(paymentMethodsResult.data.currency);
    if (paymentMethodsResult.data.methods[0]) {
      setselectedMethod(paymentMethodsResult.data.methods[0]);
    }
    let tempItems = getItems();
    await setitems(getContentCount(tempItems));

    const { data } = await clientApi.get(`/api/settings/countryByIp`);
    setcountryCode(data);
    const amount = getTotalPrice(user, data);
    setpayment({
      ...payment,
      amount,
    });
    await setDiscountAmount(0);
    if (discountData) {
      await setDiscountAmount(caculateDiscountEachItem(discountData));
      if (user.country.currency == "INR") {
        await setDiscountAmount(Math.round(discountAmount));
      }
    }

    await setpayment({
      ...payment,
      discountValue: discountAmount,
    });
    if (discountAmount > amount) {
      await setpayment({
        ...payment,
        totalPayment: 0,
      });
    } else {
      await setpayment({
        ...payment,
        totalPayment: amount - discountAmount,
      });
    }

    if (tempItems.length) {
      const { data } = await clientApi.get(
        `/api/coupons/findAvailable${toQueryString({
          limit: 10,
          items: tempItems.map((i: any) => i._id),
        })}`
      );
      setavailableCoupons(data);
      setcanGetMore(data.length == 10);
    }
  };

  useEffect(() => {
    alertify.set("notifier", "position", "top-right");

    const fetchData = async () => {
      await startFunc();
    };

    fetchData();
  }, []);

  return (
    <div>
      {!items?.length && (
        <div id="wrapper">
          <section className="checkout">
            <div className="container mb-3">
              <div className="checkout-area mx-auto mw-100 pl-5">
                <div className="order-area breadcrumbs_area mw-100">
                  <div className="section_heading_wrapper">
                    <h3 className="section_top_heading pt-4">My Cart</h3>
                  </div>
                </div>

                <figure className="mx-auto">
                  <img
                    src="../../../../../assets/images/AddtoCart-amico1.png"
                    alt=""
                  />
                </figure>

                <h3 className="text-center">Hey, There is nothing here </h3>
                <p className="text-center">Lets get some courses</p>

                <div className="explore-btn mx-auto">
                  <a
                    className="text-center text-white px-3"
                    href="/course/home"
                  >
                    Explore
                  </a>
                </div>
              </div>
            </div>
            <div className="container">
              <div className="checkout-area mx-auto mw-100 pl-5">
                <div className="row">
                  <div className="col-lg-12 order-lg-1 order-2">
                    {bestSellers && bestSellers.length > 0 && (
                      <div>
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            Our Recommendation
                          </h3>
                        </div>
                        <div className="row">
                          {bestSellers.map((item: any, index: any) => {
                            return (
                              <div className="col-md-3" key={index}>
                                <div className="purchase-cart-new pr-0 mb-3">
                                  <div className="course-item course-item_new has-border">
                                    <div className="box box_new p t-0">
                                      <div
                                        className="image-wrap cursor-pointer"
                                        onClick={() => viewDetails(item)}
                                      >
                                        <PImageComponent
                                          height={141}
                                          fullWidth
                                          type="course"
                                          imageUrl={item.imageUrl}
                                          backgroundColor={item.colorCode}
                                          text={item.title}
                                          radius={9}
                                          fontSize={15}
                                        ></PImageComponent>
                                      </div>
                                      <div className="box-inner box-inner_new">
                                        <div className="status seller-info seller-info_new">
                                          <span>Bestseller</span>
                                        </div>
                                        <h4>{item.title}</h4>
                                        <p>{item.user?.name}</p>
                                        {item.subjects &&
                                          item.subjects.length && (
                                            <p>{item.subjects[0].name}</p>
                                          )}
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice {...item} />
                                        </div>
                                        <div>
                                          <a
                                            className="btn btn-outline btn-block"
                                            onClick={() => addToCart(item)}
                                          >
                                            Add To Cart
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {items?.length && (
        <div id="wrapper">
          <section className="checkout">
            <div className="container">
              <div className="checkout-area mx-auto mw-100 pl-5">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="order-area breadcrumbs_area">
                      <div className="section_heading_wrapper">
                        <h3 className="section_top_heading pt-4">My Cart</h3>
                      </div>
                    </div>
                    {items.map((item: any, i: any) => {
                      return (
                        <div className="order-details" key={"cart_item" + i}>
                          <div className="form-row bg-white p-2 border-dark border-rounded">
                            <div className="col">
                              <div className="order-details-wrap clearfix">
                                <div className="form-row">
                                  <div className="col-auto">
                                    {item.imageUrl && (
                                      <figure>
                                        <img
                                          src={item.imageUrl}
                                          alt=""
                                          className="cart_product_img"
                                        />
                                      </figure>
                                    )}
                                    {!item.imageUrl && (
                                      <div>
                                        {item.typeItem === "course" && (
                                          <figure>
                                            <img
                                              src="/assets/images/defaultCourses.png"
                                              className="cart_product_img"
                                            />
                                          </figure>
                                        )}
                                        {item.typeItem === "testseries" && (
                                          <figure>
                                            <img
                                              src="/assets/images/testSSeries.png"
                                              className="cart_product_img"
                                            />
                                          </figure>
                                        )}
                                        {item.typeItem === "practice" && (
                                          <figure>
                                            {item.testMode == "learning" && (
                                              <img
                                                src="/assets/images/shape-3.png"
                                                className="cart_product_img"
                                              ></img>
                                            )}
                                            {item.testMode == "proctored" && (
                                              <img
                                                src="/assets/images/shape-2.png"
                                                className="cart_product_img"
                                              ></img>
                                            )}
                                            {item.testMode == "practice" && (
                                              <img
                                                src="/assets/images/shape-1.png"
                                                className="cart_product_img"
                                              />
                                            )}
                                          </figure>
                                        )}
                                        {item.typeItem === "service" && (
                                          <figure>
                                            <img
                                              src="/assets/images/st-img5.png"
                                              className="cart_product_img"
                                            />
                                          </figure>
                                        )}
                                        {!item.typeItem && (
                                          <figure>
                                            <img
                                              src="/assets/images/product-img.png"
                                              className="cart_product_img"
                                            />
                                          </figure>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="col d-flex align-items-center">
                                    <div className="order-info">
                                      <h4 className="title">{item.title}</h4>
                                      <p className="py-1">
                                        by{" "}
                                        <b>
                                          {item.brandName
                                            ? item.brandName
                                            : item?.useName}
                                        </b>
                                      </p>
                                      {item.rating && (
                                        <RatingComponent value={item.rating} />
                                      )}
                                      {item.rating && (
                                        <>
                                          <span style={{ color: "orange" }}>
                                            &nbsp;&nbsp;
                                            {round10(item.rating, -1)}
                                          </span>
                                          <span>
                                            &nbsp;&nbsp;({item.sections.length}{" "}
                                            &nbsp;ratings)
                                          </span>
                                        </>
                                      )}
                                      {item.subjects &&
                                        item.subjects.length && (
                                          <p className="bottom_info mt-0">
                                            {item.subjects[0]?.name}
                                            {item.subjects.length > 1 && (
                                              <span
                                                data-toggle="tooltip"
                                                data-placement="right"
                                                title={getTitle(item.subjects)}
                                                className="content-tag-total"
                                              >
                                                + {item.subjects.length - 1}{" "}
                                                more
                                              </span>
                                            )}
                                          </p>
                                        )}

                                      <p className="py-1">
                                        {/* Log the current value of contentCount and pause execution */}
                                        {(() => {
                                          console.log(
                                            "Current contentCount:",
                                            item?.contentCount
                                          );
                                          //debugger;
                                        })()}

                                        {/* Display duration for all items */}
                                        {item && item.duration && (
                                          <span>
                                            &#x2022; <b>{item.duration}</b> days
                                          </span>
                                        )}

                                        {/* Display content count for course and specific testseries */}
                                        {/* {(item?.contentCount && item?.typeItem === "course" ||
                                          (item?.typeItem === "testseries" &&
                                            item?.type === "other"))  && (
                                          <span className="mx-1">
                                            &#x2022; <b>{item.contentCount}</b>{" "}
                                            contents
                                          </span>
                                        )} */}

                                        {/* Display assessments count for testseries (excluding 'other' type) */}
                                        {item?.contentCount &&
                                          item?.typeItem === "testseries" &&
                                          item?.type !== "other" && (
                                            <span className="mx-1">
                                              &#x2022;{" "}
                                              <b>{item.contentCount}</b>{" "}
                                              assessments
                                            </span>
                                          )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-auto ml-auto">
                              <div className="price ml-auto">
                                <ItemPrice
                                  {...item}
                                  oldPriceclassName="line-through"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              id="clear"
                              aria-label="this button is used to remove from cart"
                              onClick={() => removeItem(item)}
                              className="btn close-btn p-0 mt-4"
                            >
                              <figure>
                                <img
                                  src="../../../../../assets/images/close-icon-2.png"
                                  alt=" clear car button"
                                />
                              </figure>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="w-25 float-right">
                      <a className="btn btn-outline btn-block" onClick={back}>
                        Continue Shopping
                      </a>
                    </div>
                  </div>

                  <div className="col-lg-8 order-lg-2 order-2">
                    {paymentMethods?.length > 1 && (
                      <div className="pt-2 pb-4">
                        {paymentMethods.map((method: any, index: any) => {
                          return (
                            <div
                              className="mb-2"
                              key={"payment_method" + index}
                            >
                              <div className="radio pl-5 pr-4 py-3 border border-dark rounded d-flex justify-content-between">
                                <div className="custom-radio ">
                                  <input
                                    className="custom-control-input"
                                    type="radio"
                                    defaultValue={method}
                                    name="paymentMethods"
                                    id={`paymentMethods_${method.name}`}
                                    value={selectedMethod}
                                    onChange={(e) =>
                                      setselectedMethod(e.target.value)
                                    }
                                  />
                                  <label
                                    className="custom-control-label py-1 bold"
                                    htmlFor={`paymentMethods_${method.name}`}
                                  >
                                    {method.name}
                                  </label>
                                </div>
                                {method.name == "paypal" && (
                                  <img
                                    src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                                    alt="PayPal Logo"
                                  ></img>
                                )}
                                {method.name == "razorpay" && (
                                  <img
                                    src="https://badges.razorpay.com/badge-dark.png "
                                    style={{ height: 48 }}
                                    alt="Razorpay | Payment Gateway | Neobank"
                                  ></img>
                                )}
                                {method.name == "ccavenue" && (
                                  <img
                                    src="http://www.ccavenue.com/images/ccav_secure_banner.gif"
                                    style={{ height: 48 }}
                                    alt="CCAvenue"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {bestSellers && bestSellers.length > 0 && (
                      <div>
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            Our Recommendation
                          </h3>
                        </div>
                        <div className="row">
                          {bestSellers.map((item: any, index: any) => {
                            return (
                              <div
                                className="col-md-4"
                                key={"best_seller" + index}
                              >
                                <div className="purchase-cart-new pr-0 mb-3">
                                  <div className="course-item course-item_new has-border">
                                    <div className="box box_new p t-0">
                                      <div
                                        className="image-wrap cursor-pointer"
                                        onClick={() => viewDetails(item)}
                                      >
                                        <PImageComponent
                                          height={141}
                                          fullWidth
                                          type="course"
                                          imageUrl={item.imageUrl}
                                          backgroundColor={item.colorCode}
                                          text={item.title}
                                          radius={9}
                                          fontSize={15}
                                        />
                                      </div>
                                      <div className="box-inner box-inner_new">
                                        <div className="status seller-info seller-info_new">
                                          <span>Bestseller</span>
                                        </div>
                                        <h4
                                          data-toggle="tooltip"
                                          data-placement="top"
                                          title={item.title}
                                        >
                                          {item.title}
                                        </h4>
                                        <p>{item.user?.name}</p>
                                        {item.subjects &&
                                          item.subjects.length && (
                                            <p>
                                              {item.subjects[0].name}
                                              {item?.subjects.length > 1 && (
                                                <span
                                                  data-toggle="tooltip"
                                                  data-placement="right"
                                                  title={getTitle(
                                                    item.subjects
                                                  )}
                                                  className="content-tag-total"
                                                >
                                                  + {item?.subjects.length - 1}{" "}
                                                  more
                                                </span>
                                              )}
                                            </p>
                                          )}
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice {...item} />
                                        </div>
                                        <div>
                                          <a
                                            className="btn btn-outline btn-block"
                                            onClick={() => addToCart(item)}
                                          >
                                            Add To Cart
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {buyItems && buyItems.length > 0 && (
                      <div>
                        <div className="section_heading_wrapper">
                          <h3 className="section_top_heading">
                            Students Also Bought
                          </h3>
                        </div>

                        <div className="row">
                          {buyItems.map((item: any, index: any) => {
                            return (
                              <div className="col-md-4" key={index}>
                                <div className="purchase-cart-new pr-0 mb-3">
                                  <div className="course-item course-item_new has-border">
                                    <div className="box box_new p t-0">
                                      <div
                                        className="image-wrap cursor-pointer"
                                        onClick={() => viewDetails(item)}
                                      >
                                        <PImageComponent
                                          height={141}
                                          fullWidth
                                          type="course"
                                          imageUrl={item.imageUrl}
                                          backgroundColor={item.colorCode}
                                          text={item.title}
                                          radius={9}
                                          fontSize={15}
                                        />
                                      </div>
                                      <div className="box-inner box-inner_new">
                                        <div className="status seller-info seller-info_new">
                                          <span>Bestseller</span>
                                        </div>
                                        <h4>{item.title}</h4>
                                        <p className="text-head-2">
                                          {item.user?.name}
                                        </p>
                                        {item.subjects &&
                                          item.subjects.length && (
                                            <p>
                                              {item.subjects[0].name}
                                              {item?.subjects.length > 1 && (
                                                <span
                                                  data-toggle="tooltip"
                                                  data-placement="right"
                                                  title={getTitle(
                                                    item.subjects
                                                  )}
                                                  className="content-tag-total"
                                                >
                                                  + {item?.subjects.length - 1}{" "}
                                                  more
                                                </span>
                                              )}
                                            </p>
                                          )}
                                        <div className="selling-price-info selling-price-info_new d-flex">
                                          <ItemPrice {...item} />
                                        </div>
                                        <div className="ment-create-btn-remove">
                                          <a
                                            className="btn btn-outline btn-block"
                                            onClick={() => addToCart(item)}
                                          >
                                            Add to Cart
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-lg-4 order-lg-1 order-1 mt-4">
                    <div className="order-box-area mycart pt-0 mt-2">
                      <div className="order-box">
                        {!availableCoupons.length && <h4>Coupons</h4>}
                        {availableCoupons.length && (
                          <div>
                            <h4 className="text-dark mb-2">
                              Available Coupons:
                            </h4>
                            <div
                              style={{
                                overflow: "auto",
                                maxHeight: 168,
                                paddingRight: 10,
                                marginBottom: 10,
                              }}
                            >
                              {availableCoupons.map((c: any, index: any) => {
                                return (
                                  <div
                                    className="d-flex justify-content-between mb-2 cursor-pointer"
                                    onClick={() => selectCoupon(c)}
                                    key={index}
                                  >
                                    <h5>{c.code}</h5>
                                    <div>
                                      {c.discountType == "percent"
                                        ? c.percent
                                        : c.price}
                                      {c.discountType == "percent" ? "%" : ""}
                                    </div>
                                  </div>
                                );
                              })}
                              {canGetMore && (
                                <div className="text-center">
                                  <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => loadMoreCoupons()}
                                  >
                                    Get More
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <form className="form-inline">
                          <input
                            type="text"
                            aria-label="apply coupon textbox"
                            className="form-control border-0 py-0 bg-transparent"
                            defaultValue={page.couponCode}
                          />
                          <button
                            type="button"
                            className="btn border-0"
                            onClick={applyCoupon}
                          >
                            CHECK
                          </button>
                        </form>
                        {error.emptyCoupon && (
                          <label className="label label-danger">
                            Please enter coupon code
                          </label>
                        )}
                        {error.coupon && (
                          <label className="label label-danger">
                            The coupon is either invalid or has expired.
                          </label>
                        )}
                        {warningCoupon && (
                          <label className="label label-danger white-space label-longer">
                            This coupon code doesn&apos;t apply to item:{" "}
                            {warningCoupon}
                          </label>
                        )}
                      </div>

                      <div className="order-box">
                        <h4>Summary</h4>
                        <div className="info">
                          <div className="row">
                            <div className="col-6">
                              <p>Original Price:</p>
                            </div>

                            <div className="col-6">
                              <div className="price ml-auto">
                                <ItemPrice
                                  price={payment.amount}
                                  currency={currency}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {payment.discountData &&
                          payment.discountData.length > 0 &&
                          discountAmount > 0 && (
                            <div className="info">
                              <div className="row">
                                <div className="col-6">
                                  <p>Coupon Discount:</p>
                                </div>

                                <div className="col-6">
                                  <div className="price discount ml-auto">
                                    <ItemPrice
                                      price={discountAmount}
                                      currency={currency}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="total">
                          <div className="row">
                            <div className="col-6">
                              <p>Total:</p>
                            </div>

                            <div className="col-6">
                              <div className="price ml-auto">
                                <ItemPrice
                                  price={payment.totalPayment}
                                  currency={currency}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <p>
                          By completing your purchase you agree to these{" "}
                          <a href="/terms">Terms of Service</a>
                        </p>
                        {!canCheckout && (
                          <div className="complete-payment-btn-remove mt-2">
                            <a
                              className="btn btn-primary btn-block"
                              onClick={() => completePayment()}
                            >
                              Complete Payment
                            </a>
                          </div>
                        )}
                        {canCheckout && (
                          <div className="mt-2">
                            {/* <ngx-paypal [config]="payPalConfig"></ngx-paypal> */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <form #form ngNoForm id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
            <input type="hidden" id="encRequest" name="encRequest" [ngModel]="encRequest">
            <input type="hidden" name="access_code" id="access_code" [ngModel]="accessCode">
        </form> */}
          </section>
        </div>
      )}
    </div>
  );
};
export default Cart;
