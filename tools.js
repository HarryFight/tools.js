/**************************************
 * Created with JetBrains WebStorm.
 * User: xaingyi
 * time: 2014 - 04 - 26
 */

/************************************
* 添加、取消事件绑定
* @param target : 要绑定事件的元素
* @param eventName : 事件名称。不加 "on". 如 : "click" 而不是 "onclick".
* @param fn : 事件处理函数
*/
function addEvent(target,eventName,fn){
    //将函数名或者整个匿名函数体转化为字符串，解决匿名函数无法解绑的问题
    var fnStr = fn.toString().replace(/\s+/g,"");
    //事件分类保存
    //判断是否有target[eventName+"event"]，如果没有讲此属性置为空对象
    target[eventName+"event"] = target[eventName+"event"] ? target[eventName+"event"] :{};
    //事件响应实际调用handler模拟
    target[eventName+"event"][fnStr]=handler;
    //下面一堆是用于注册函数兼容，实际调用handler
    if(target.addEventListener){
        target.addEventListener(eventName,handler,false);
    }else if(target.attachEvent){
        target.attachEvent("on"+eventName,handler);
    }else{
        target["on"+eventName] = handler;
    }

    function handler(ev){
        //下面为DOM标准(ev)和IE下的兼容(window.event)
        var event = ev || window.event,
            //保存DOM标准下的两种方法，因为后面会覆盖掉
            stopPropagation = event.stopPropagation,
            preventDefault = event.preventDefault;
            //下面是事件目标和事件正在处理元素的兼容
            event.target = event.target || event.srcElement;
            event.currentTarget = event.currentTarget || target;
            //取消事件的捕获和冒泡（重写这两个函数）
            event.stopPropagation = function(){
                if(!event.stopPropagation){
                    event.cancelBubble = true; //IE下取消事件冒泡
                }else{
                    stopPropagation.call(event);//DOM标准下取消，改变this指向为event
                }
            };
            //取消事件默认行为
            event.preventDefault = function(){
                if(!event.preventDefault){
                    event.returnValue = false; //IE下取消默认事件
                }else{
                    preventDefault.call(event);//DOM标准下取消，改变this指向为event
                }
            }

            //调用真正要绑定的函数，用call改变this指向为target，参数为事件对象
            var flag = fn.call(target,event);
            //当返回值为false时取消捕获和冒泡以及默认行为
            if(flag === false){
                event.stopPropagation();
                event.preventDefault();
            }
    }
}
function  removeEvent(target,eventName,fn){
    var fnStr =  fn.toString().replace(/\s+/g,""),
        handler;
    //判断是否有此事件分类，在没有的情况下返回函数
    if(target[eventName+"event"]){
        //将保存的函数名，或者匿名函数体赋值给handler，以便取消
        handler = target[eventName+"event"][fnStr];
    }else{
        return;
    }
    if(target.removeEventListener){
        target.removeEventListener(eventName,handler,false);
    }else if(target.detachEvent){
        target.detachEvent("on"+eventName,handler);
    }else{
        target["on"+eventName] = null;
    }
}
/************************************
 * 取消对象所有事件函数
 * @param target : 要取消绑定事件的元素
 * @param eventName : 事件名称。不加 "on". 如 : "click" 而不是 "onclick".
 */
function removeAll(target,eventName){
    //判断是否有此事件分类
    if(target[eventName+"event"]){
        var all = target[eventName+"event"];
        //循环解绑
        for(var key in all){
            if(all.hasOwnProperty(key)){
                removeEvent(target,eventName,key);
            }
        }
    }
}
/************************************
 * 事件代理
 * @param target : 要绑定事件的元素
 * @param delegate : 被代理元素
 * @param eventName : 事件名称。不加 "on". 如 : "click" 而不是 "onclick".
 * @param fn : 事件处理函数
 */
function live(target,delegate,eventName,fn){
    addEvent(target,eventName,handler);

    function handler(ev){
        //target为目前冒泡到的元素
        var target = ev.target;
        var item = delegate;
        for(var i = 0,len = item.length; i < len;i++){
            //如果是被代理的元素，则触发事件
            if(target == item[i]){
                //此处返回是因为要同事件函数是否取消冒泡和默认事件同步
                return fn.call(target,ev);
            }
        }
    }
}
/************************************
 *  focus、blur事件的冒泡实现
 * @param target
 * @param fn
 */
function focus(target,fn){
    if(target.addEventListener){
        target.addEventListener("focus",fn,true);
    }else if(target.attachEvent){
        target.attachEvent("onfocusin",fn);
    }
}
function blur(target,fn){
    if(target.addEventListener){
        target.addEventListener("blur",fn,true);
    }else if(target.attachEvent){
        target.attachEvent("onfocusout",fn);
    }
}
/************************************
 * mouseenter、mouseleave函数所有浏览器兼容
 * @param targer
 * @param fn
 */
function mouseenter(target,fn){
    if(target.addEventListener){
        addEvent(target,"mouseover",handler);
    }else if(target.attachEvent){
        addEvent(target,"mouseenter",fn)
    }
    function handler(ev){
        var target = ev.target,
            fromElem = ev.relatedTarget;
        if(fromElem.contains(target) && this == target){
            return fn.call(target,ev);
        }
    }
}
function mouseout(target,fn){
    if(target.addEventListener){
        addEvent(target,"mouseout",handler);
    }else if(target.attachEvent){
        addEvent(target,"mouseleave",fn);
    }

    function handler(ev){
        var target = ev.target,
            fromEle = ev.relatedTarget;
        if(fromEle.contains(target) && this == target){
            return fn.call(target,ev);
        }
    }
}
/************************************
 * 匀速运动
 * @param target : 对象
 * @param json : 目标值的json对象
 * @param time : 运动时间,默认为1000ms
 * @param callback :回调函数
 */
function constant(target,json,time,callback){
    //浏览器刷新频率
    var timeScale = 1000/60,
    //运动总共会刷新的次数,count可以由传入时间设置
        time = time || 1000,
        scale = time/timeScale,
        begin,
        //步长值
        speed;

    if(target.timer){
        clearInterval(target.timer);
    }

    //初始化步长值
    for(var key in json){
        //获取对象对应值的初始值
        begin = parseFloat(window.getComputedStyle(target,null)[key]);
        //计算步长值，并将步长值赋值给对象对应属性
        speed = (json[key] - begin)/scale;
        target[key] = speed;
    }

    //运动过程
    target.timer = setInterval(function(){
        //初始化停止标志
        var stop = true;
        for(var key in json){
            var newValue,oldValue;
            oldValue = parseFloat(window.getComputedStyle(target,null)[key]);
            //每次运动加上步长，变成newvalue
            newValue = oldValue + target[key];

            //停止判断，当与目标值无限趋近时停止
            if(Math.abs(newValue - json[key]) < 1){
                target.style[key] = json[key] +"px";
                //直接赋值成目标值后，取消后续操作
                continue;
            }else{
                //若未到停止条件，将停止标志设置为false
                stop = false;
            }

            target.style[key] = newValue +"px";
        }

        //当停止标志为true时停止
        if(stop){
            clearInterval(target.timer);
            if(typeof  callback == "function"){
                callback();
            }
        }
    },timeScale);
}
/************************************
 * 减速运动
 * @param target : 减速运动对象
 * @param json : 目标值的json对象
 * @param scale: 运动频率,默认20
 * @param callback :回调函数
 */
function decelerate(target,json,scale,callback){
    //浏览器刷新频率
    var timeScale = 1000/60,
    //运动总共会刷新的次数,count可以由传入时间设置
        scale = scale||20;

    if(target.timer){
        clearInterval(target.timer);
    }
    target.timer = setInterval(function(){
        var stop = true;
        for(var key in json){
            var oldValue,newValue,speed;
            //减速运动与匀速运动的区别在此:
            // 减速运动会在每次运动完后在此处计算一次新的步长，所以步长会越来越小
            oldValue = parseFloat(window.getComputedStyle(target,null)[key]);
            //每次计算出来的步长都不一样
            speed = (json[key] - oldValue) / scale;
            newValue = oldValue + speed;

            //此处为停止标志，同匀速运动
            if(Math.abs(newValue - json[key]) < 1){
                target.style[key] = json[key] + "px";
                continue;
            }else{
                stop = false;
            }

            target.style[key] = newValue + "px";
        }

        if(stop){
            clearInterval(target.timer);
            if(typeof callback == "function"){
                callback();
            }
        }
    },timeScale);
}
/************************************
 * 加速运动
 * @param target : 对象
 * @param json : 目标值的json对象
 * @param scale: 运动频率,默认20
 * @param callback :回调函数
 */
function accelerate(target,json,scale,callback){
    var timeScale = 1000/60,
        scale = scale || 20,
        begin,speed;
    //停止初始值
    for(var key in json){
        begin = parseFloat(window.getComputedStyle(target,null)[key]);
        //此处为最大速度
        target[key] = (json[key] - begin)/scale;
    }
    if(target.timer){
        clearInterval(target.timer)
    }

    target.timer = setInterval(function(){
        var stop = true;
        for(var key in json){
            var oldValue,newValue;
            oldValue = parseFloat(window.getComputedStyle(target,null)[key]);
            //因为是加速运动，为减速运动逆过程
            // 所以由最大速度减去当前逐渐变小的速度，则速度开始逐渐变大
            speed = target[key]  - (json[key] - oldValue)/scale;

            //因为最开始的时候
            // 最大速度是相同的，相减后为0，所以得赋初速度
            if(!speed){
                //当现在的值减去目标值为负，则给正方向的初速度
                speed = (oldValue - json[key]) < 0 ? 5 : -5;
            }

            //停止条件
            if(Math.abs(oldValue - json[key]) < 1 || (target[key] - speed) < 5){
                target.style[key] = json[key] +"px";
                continue;
            }else{
                stop = false;
            }
            newValue = oldValue + speed;
            target.style[key] = newValue +"px";

        }
        if(stop){
            clearInterval(target.timer);
            if(typeof callback == "function"){
                callback();
            }
        }
    },1000/60)

}
/************************************
 * 弹性运动
 * @param target : 对象
 * @param json : 目标值的json对象
 * @param scale: 运动频率,默认20
 * @param callback :回调函数
 */
function dap(target,json,scale,callback){
    var timeScale = 1000/60,
        scale = scale || 20;

    for(var key in json){
        //初始速度赋值为0
        target[key]  = 0;
    }

    target.timer = setInterval(function(){
        var stop = true;
        for(var key in json){
            var speed,oldValue,newValue;
            oldValue = parseFloat(window.getComputedStyle(target,null)[key]);
            //弹性运动做加速度减小的变加速运动
            //当运动速度很快的时候，会一下超过目标点，这时候加速度值马上变为负方向
            //通过这个来模拟弹簧运动
            target[key] = target[key] + (json[key] - oldValue)/scale;
            //给运动加上摩擦系数
            target[key] *= 0.7;
            speed = target[key];

            //停止判断
            if(Math.abs(oldValue - json[key]) < 10e-1){
                target.style[key] = json[key] + "px";
                continue;
            }else{
                stop = false;
            }
            newValue = oldValue + speed;
            target.style[key] = newValue + "px";
        }
        if(stop){
            clearInterval(target.timer);
            if(typeof callback == "function"){
                callback();
            }
        }
    },timeScale)
}
/************************************
 * 布局转化
 * @param target : 要转化的对象
 * @param child : 子元素的数组
 * @return 保存子元素位置的数组
 */
function toLayout(parent,child){
    //保存元素的位置
    var pos =[],
        len = child.length;
    parent.style.position = "relative";

    for(var i = 0; i < len ; i++){
        var top = child[i].offsetTop,
            left = child[i].offsetLeft;

        pos.push({
            top:top,
            left:left
        });
    }
    //开始转化
    for(var i = 0; i < len ; i++){
        var item = child[i];
        item.style.position = "absolute";
        item.style.top = pos[i].top + "px";
        item.style.left = pos[i].left + "px";
        //清除元素的margin值
        item.style.margin = "0px";
    }
    return pos;
}
/************************************
 * 碰撞检测
 * @param obj1
 * @param obj2
 * @returns {boolean}
 */
function hitTest(obj1,obj2){
    var t1 = obj1.offsetTop,
        t2 = obj2.offsetTop,
        h1 = obj1.offsetHeight,
        h2 = obj2.offsetHeight,
        l1 = obj1.offsetLeft,
        l2 = obj2.offsetLeft,
        w1 = obj1.offsetWidth,
        w2 = obj2.offsetWidth;
    //碰撞条件用九宫格法，当四个条件之一满足一个时就不会碰撞
    if(!(t1+h1<t2 || t2+h2<t1 || l1+w1<l2 || l2+w2<l1)){
        return true;
    }else{
        return false;
    }
}
/************************************
 * 对象的类型判断
 * @param obj : 要判断的对象
 * @param type :　类型
 */
function is(obj,type){
      return Object.prototype.toString.call(obj) == "[object"+type+"]";
}

/************************************
 * 转化为普通数组
 * @param obj : 要转化的对象
 */
function toArray(obj){
    var temp = [],
        len = obj.length;

    //当对象是节点对象，或者当对象有length属性和元素时转化
    if(is(obj,"NodeList") || (obj[0] && obj.length )){
        for(var i = 0;i < len;i++){
            temp.push(obj[i]);
        }
    }else{
        temp = [obj];
    }

    return temp;
}
/************************************
 * 兼容的forEach函数
 * @param arr : 数组
 * @param fn : 函数，接受3个参数（item,index,arr）
 */
function each(arr,fn){
    if([].forEach){
        arr.forEach(fn);
    }else{
        for(var i = 0,len = arr.length;i < len; i++ ){
            //apply调用fn函数，接受三个参数arr[i],i,arr
            fn.apply(arr,[arr[i],i,arr]);
        }
    }
}
/************************************
 * 产生一组完全不等随机数的函数
 * @param Max : 产生随机数最大的范围
 * @param len : 随机数个数
 * 返回数组
 */
function getRandom(Max,len){
    var temp = [];

    while(temp.length<len){
        //设置标志检测产生的随机数是否相等
        var flag = true;
        //向上取整1-Max
        var r = Math.ceil(Math.random()*Max);
        //第一次产生的随机数不进入循环
        for(var i = 0;i < temp.length;i++){
            if(temp[i] == r){
                flag = false;
            }else{
                flag = true;
            }
        }

        if(flag){
            temp[temp.length]  = r;
        }
    }
    return temp;
}
/**
 * JSON.parse的兼容实现
 * @param data
 * @constructor
 */
function JSONParse(data){
    //此正则匹配 \],:{}空白符
    var rvalidchars = /^[\],:{}\s]*$/,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+):?/g,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

    if(typeof data !== "string" || !data){
        return null;
    }
    data = self.trim(data);
    if(window.JSON && window.JSON.parse){
        return window.JSON.parse(data);
    }
    if( rvalidchars.test( data.replace(rvalidescape,"@")
                               .replace(rvalidtokens,"]")
                               .replace(rvalidbraces,""))){
        return(new Function("return" + data))();
    }
}
