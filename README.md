tools.js
========

这是一个简单封装了一些常用函数的简易库，主要是事件、运动

1、兼容性
-----------------------------------
  IE6+、Chrome、Firefox、Safari、Opera等浏览器
2、使用说明
-----------------------------------
### addEvent(target,eventName,fn)， removeEvent(target,eventName,fn)
    /************************************
    * 添加、取消事件绑定
    * @param target : 要绑定事件的元素
    * @param eventName : 事件名称。不加 "on". 如 : "click" 而不是 "onclick".
    * @param fn : 事件处理函数
    */
    
### removeAll(target,eventName)
    /************************************
     * 取消对象所有事件函数
     * @param target : 要取消绑定事件的元素
     * @param eventName : 事件名称。不加 "on". 如 : "click" 而不是 "onclick".
     */

### live(target,delegate,eventName,fn)
    /************************************
     * 事件代理
     * @param target : 要绑定事件的元素
     * @param delegate : 被代理元素
     * @param eventName : 事件名称。不加 "on". 如 : "click" 而不是 "onclick".
     * @param fn : 事件处理函数
     */

### focus(target,fn)，blur(target,fn)，mouseenter(target,fn)，mouseout(target,fn)
    /************************************
     *  focus、blur事件的冒泡实现，mouseenter、mouseleave函数所有浏览器兼容
     * @param target
     * @param fn
     */
### constant(target,json,time,callback)，decelerate(target,json,scale,callback)，accelerate(target,json,scale,callback)，dap(target,json,scale,callback)
    /************************************
     * 匀速、减速、加速、弹性
     * @param target : 对象
     * @param json : 目标值的json对象
     * @param time/scale :  运动时间,默认为1000ms/运动频率,默认20
     * @param callback :回调函数
     */
### 几个简单的工具函数
    /************************************
     * 布局转化
     * @param target : 要转化的对象
     * @param child : 子元素的数组
     * @return 保存子元素位置的数组
     */
    function toLayout(parent,child)
    /************************************
     * 碰撞检测
     * @param obj1
     * @param obj2
     * @returns {boolean}
     */
    function hitTest(obj1,obj2)
    /************************************
     * 对象的类型判断
     * @param obj : 要判断的对象
     * @param type :　类型
     */
    function is(obj,type)
    
    /************************************
     * 转化为普通数组
     * @param obj : 要转化的对象
     */
    function toArray(obj)
    /************************************
     * 兼容的forEach函数
     * @param arr : 数组
     * @param fn : 函数，接受3个参数（item,index,arr）
     */
    function each(arr,fn)
    /************************************
     * 产生一组完全不等随机数的函数
     * @param Max : 产生随机数最大的范围
     * @param len : 随机数个数
     * 返回数组
     */
    function getRandom(Max,len)



