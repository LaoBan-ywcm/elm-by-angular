import {Component, HostBinding, OnInit} from '@angular/core';
import {UserService,ERRORS} from "../../service/user-service";
import {Location} from "@angular/common";
import {routerAnimation} from "../../animations";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations:[routerAnimation]
})
export class LoginComponent implements OnInit {

  constructor(
    private userService:UserService,
    private location:Location
  ) { }

  @HostBinding('@routeAnimation') routeAnimation=true;
  @HostBinding('style.display') display='block';

  loginByPhoneNum=true;//登录方式
  notice:String;//登陆提示信息
  hasSend=false;//是否成功发送
  resend=false;//是否允许重新发送
  verifyBtnContent='发送验证码';//发送按钮内容
  resendInterval;//发送短信倒计时
  verifyCode;//短信验证码
  captcha;//图片验证码地址
  captchaCode;//图片验证码输入
  phone;//电话号码
  username;
  password;
  loginFail=false;//第一次登录失败
  logining=false;

  ngOnInit() {
  }

  sendMessage(captchaCode,phoneNum:Number){
    this.userService.sendMessage(captchaCode,phoneNum)
      .then(resp => {
        console.log(resp);
        this.hasSend=true;
        this.resend=false;
        this.changeContent();
      })
      .catch(err => {
          this.captchaInput(err);
      })
  }

  changeContent(){
    if(this.hasSend&&!this.resend){
      let time=30;
      this.resendInterval=setInterval(() => {
        this.verifyBtnContent=(time--)+'s 后重新发送'
        if(time==0){
          this.resend=true;
          this.changeContent();
          clearInterval(this.resendInterval);
        }
      },1000)
    }else if(this.hasSend&&this.resend){
      this.verifyBtnContent='重新发送';
    }
  }

  mobileLogin(code:Number){
    this.logining=true;
    this.userService.mobileLogin(code)
      .then(response => {
        this.logining=false;
        window.history.back();
      })
      .catch(err => {
        this.logining=false;
      })
  }

  passwordLogin(){
    this.logining=true;
    this.userService.passwordLogin(this.username,this.password,this.captchaCode||'')
      .then(response => {
        window.history.back();
        this.logining=false;
      })
      .catch(err => {
        console.log(err)
        this.captchaInput(err);
        this.logining=false;
      })
  }

  captchaInput(err){
    let error=JSON.parse(err.message);
    switch (error.name){
      case ERRORS.CAPTCHA_NONE_ERROR:
        this.loginFail=true;
        this.userService.requestCaptchaCode()
          .then(response => {
            this.captcha=response.code;
          })
          .catch(err => {
            this.notice=err.message;
          });
        break;
      case ERRORS.USER_AUTH_FAIL:
        this.notice=error.message;
        break;
      default:
        this.notice=error.message;
    }
  }

}

class PhoneNumLogin {
  constructor(
    private phoneNum:Number,
    private verifyCode:Number
  ){}
}
