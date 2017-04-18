import {Injectable, OnInit} from "@angular/core";
import {CityService} from "./city-service";
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Subject, Observable} from "rxjs";

@Injectable()
export class ShoppingService {
  constructor(private http: Http) {
    if (!this.location) {
      this.location = JSON.parse(localStorage.getItem('location')) || '';
    }
    console.log('shoppingservice Init')
  }

  //保存购物车
  shopping = new Subject();
  shoppingCart$ = this.shopping.asObservable();
  shoppingCart={};

  location;
  sellerDetail;
  sellerId;

  getScore(){
    return this.http.get(`/api/ugc/v2/restaurants/${this.sellerId}/ratings/scores`)
  }

  getTags(){
    return this.http.get(`/api/ugc/v2/restaurants/${this.sellerId}/ratings/tags`)
      .toPromise()
      .then(response => {
        return Promise.resolve(response.json());
      })
      .catch(response => {
        console.log(response)
      })
  }

  getRatings(offset,tagName){
    return this.http.get(`/api/ugc/v2/restaurants/${this.sellerId}/ratings?has_content=true&tag_name=${tagName}&offset=${offset||0}&limit=10`)
      .toPromise()
      .then(response => {
        return Promise.resolve(response.json());
      })
      .catch(response => {
        console.log(response)
      })
  }

  getActivity(){
    return this.http.get(`/api/shopping/v1/restaurants/activity_attributes?latitude=${this.location.latitude}&longitude=${this.location.longitude}&kw=`)
      .toPromise()
      .then(response => {
        return Promise.resolve(response.json())
      })
      .catch(response => {
        console.log(response)
      })
  }

  getDeliveryMode(){
    return this.http.get(`/api/shopping/v1/restaurants/delivery_modes?latitude=${this.location.latitude}&longitude=${this.location.longitude}&kw=`)
      .toPromise()
      .then(response => {
        return Promise.resolve(response.json())
      })
      .catch(response => {
        console.log(response)
      })
  }

  getSchema(){
    return this.http.get(`/api/shopping/restaurant/category/urlschema?latitude=${this.location.latitude}&longitude=${this.location.longitude}&flavor_ids[]=207&flavor_ids[]=220&flavor_ids[]=233&flavor_ids[]=260&show_name=%E7%BE%8E%E9%A3%9F`)
      .toPromise()
      .then(response => {
        return Promise.resolve(response.json());
      })
      .catch(response => {
        console.log(response);
      })
  }

  getCategoryList(offset,id){
    return this.http.get(`/api/shopping/restaurants?latitude=${this.location.latitude}&longitude=${this.location.longitude}&keyword=&offset=${offset}&limit=20&extras[]=activities&restaurant_category_ids[]=207`)
      .toPromise()
      .then(response => {
        return Promise.resolve(response.json())
      })
      .catch(response => {
        console.log(response)
      })
  }

  getCategory(): Promise<any> {
    return this.http.get('/api/v2/index_entry?geohash=' + this.location.geohash + '&group_type=1&flags[]=F')
      .toPromise()
      .then(response => response.json())
      .catch(err => console.log(err));
  }

  getHotSearch(){
    return this.http.get(`/api/shopping/v3/hot_search_words?latitude=${this.location.latitude}&longitude=${this.location.longitude}`)
      .toPromise()
      .then(response => {
        return Promise.resolve(response.json());
      })
      .catch(response => {
        throw new Error(JSON.stringify(response.json()))
      })
  }

  getRecommendSeller(params) {
    let activity='';
    if(params.activities){
      params.activities.forEach(function(id){
        activity+='&support_ids[]='+id;
      })
    }
    return this.http.get(`/api/shopping/restaurants${params.search?'/search':''}?latitude=${this.location.latitude}&longitude=${this.location.longitude}&offset=${params.offset||0}&limit=20&extras[]=activities&keyword=${params.keyword||''}&search_item_type=${params.searchType||2}&restaurant_category_id=&restaurant_category_ids[]=${params.categoryId||''}&order_by=${params.orderBy||''}&delivery_mode[]=${params.deliveryMode||''}${activity}`)
      .toPromise()
      .then(response => response.json())
      .catch(err => console.log(err));
  }

  getSellerDetail(id) {
    this.sellerId=id;
    return this.http.get(`/api/shopping/restaurant/${id}?extras[]=activities&extras[]=album&extras[]=license&extras[]=identification&extras[]=statistics&latitude=${this.location.latitude}&longitude=${this.location.longitude}`)
      .toPromise()
      .then(response => response.json())
      .catch(err => console.log(err));
  }

  getMenu() {//查看是否有缓存
    let history=sessionStorage.getItem('s'+this.sellerDetail.id);
    if(history){
      return Promise.resolve(JSON.parse(history));
    }else{
      return this.http.get(`/api/shopping/v2/menu?restaurant_id=${this.sellerId}`)
        .toPromise()
        .then(response => response.json())
        .catch(err => console.log(err));
    }
  }

  setCartHistory(menu){//如果购物车不为空 将菜单缓存，以便跟购物车同步
    if(this.shoppingCart['s'+this.sellerDetail.id]&&this.shoppingCart['s'+this.sellerDetail.id].length>0){
      sessionStorage.setItem('s'+this.sellerDetail.id,JSON.stringify(menu));
    }else{
      sessionStorage.removeItem('s'+this.sellerDetail.id);
    }
  }

  addToCart(food){//加入购物车，并且标识商家id ，保存在service中
    if(!this.shoppingCart['s'+this.sellerDetail.id]){
      this.shoppingCart['s'+this.sellerDetail.id]=[];
    }
    this.shoppingCart['s'+this.sellerDetail.id].push(food);
    return this.shoppingCart['s'+this.sellerDetail.id].length-1;
  }

  subtractCart(index){//移除购物车
    this.shoppingCart['s'+this.sellerDetail.id].splice(index,1);
  }

  refreshCart(){//刷新购物车
    if(this.shoppingCart['s'+this.sellerDetail.id]){
      this.shopping.next(this.shoppingCart['s'+this.sellerDetail.id]);
    }else{
      this.shopping.next([]);
    }
  }
}

let imgUrl = 'https://fuss10.elemecdn.com';

export function getImgPath(path) {
  let suffix;
  if (!path) {
    return 'http://test.fe.ptdev.cn/elm/elmlogo.jpeg'
  }
  if (path.indexOf('jpeg') !== -1) {
    suffix = '.jpeg'
  } else {
    suffix = '.png'
  }
  let url = '/' + path.substr(0, 1) + '/' + path.substr(1, 2) + '/' + path.substr(3) + suffix;
  return imgUrl + url;
}

export let debounce=(function () {
  let debounceControl=false;
  let debounceTime;
  return function debounce(fn) {

    if (debounceControl) {
      if (debounceTime) {
        clearTimeout(debounceTime);
      }
    }
    debounceControl = true;

    debounceTime = setTimeout(() => {
      fn();
      debounceControl = false;
    }, 200);

  }
})();
