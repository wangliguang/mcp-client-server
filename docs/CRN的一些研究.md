@[TOC](目录)
> 好吧，我承认我跟CRN的拆包和预加载干上了，内容可能有理解错误地方，欢迎各位大佬批评指正

# 一、bridge相关
## 1. 多bridge的设计目的
 
 - 在携程内部有很多的业务，每个业务由不同的团队负责，为了避免两个业务之前的互相干扰(比如同样的全局变量等)，就设计多bridge，也就是说每个业务一个bridge环境，借此实现业务隔离。

## 2. 多bridge的设计原理
 - 目前查看源码birdge并没有实现复用，但后续CRN会更新实现

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/d9d23a65e05fc0413f5c616a0bbce260.png)
## 3. 多bridge下应用内更新
- 在应用内更新业务时，先清空掉之前cache的A业务用过的bridge，再重新加载
# 二、Bundle相关
## 1. Metro的两种打包格式
- [分析一下metro下两种Bundle格式](https://blog.csdn.net/gg_ios/article/details/100663016)
## 2. CRN是如何拆包的
- CRN打包是借鉴`File RAM Bundle`中`nativeRequire`按需加载的思路，并做了一些定制
- 因为CRN打出的Bundle是可以和Plain Bundle混用的，因此我猜测CRN的打包本质上还是Plain Bundle，但实现了按需加载

## 3. CRN的分平台打包
- 目的是抹平组件的平台差异，解决资源加载路径不一致的问题。很长一段时间，我们iOS/Android的业务代码，只打一次包，以iOS平台打包。因为涉及到Native代码的新组建的引入，都是由框架团队控制，所以一直以来都没出什么问题。直到公司内部独立App，他们引入的第三方组件iOS/Android有差异，导致发布之后在Android上运行有问题。
- 分平台打包之后，先打包iOS，再打包Android，将差异代码存储在js-diff目录，加载时，Andorid先在js-diff中查找模块，查找得到直接使用，如果查找不到，再在默认的js-modules文件夹中查找。iOS则只在js-modules文件夹中进行模块查找。

## 4. 创建bridge两种方式的区别
- 之前官方是这样建议的：当多个RCTRootView时建议使用initWithDelegate，否则建议使用initWithBundleURL，而现在initWithBundleURL已经被弃用
- **疑问：看源码感觉没啥区别啊，只不过是通过不同的方式获取BundleUrl而已，但为什么initWithBundleURL会被弃用**

## 5. Bundle拆分可以提高性能的依据
- 从这张图中可以看出，最大的瓶颈在JS Init+Require，这部分时间就是JSBundle的执行时间，为了提升页面加载速度，我们需要做的就是将该部分时间尽可能降低。
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/92e3df6b1bc77013a464a9d87037f736.jpeg#pic_center)

## 6. 内联引用
- **内联引用(require 代替 import)可以延迟模块或文件的加载，直到实际需要该文件**，建议直接查看官方的栗子[内联引用](https://reactnative.cn/docs/performance/#%E6%8B%86%E5%8C%85ram-bundles-%E5%92%8C%E5%86%85%E8%81%94%E5%BC%95%E7%94%A8)
- 但内联引用的优势只能在RAM Bundle中提现出来，因为Plain Bundle不管你是什么时候引用模块，都会在创建Bridge时将Bundle中所有模块记载并执行，在CRN基础包的空壳就是使用的内联引用。
- 在CRN基础包空壳子里有如下一个订阅，指定要引入跳转哪个页面，require本身是不支持变量的，CRN内部对对require进行了修改
```javascript
//native访问业务包，上报事件通知需要加载的模块ID
DeviceEventEmitter.addListener("requirePackageEntry", function (event) {
  if (event && event.packagePath) {
    global.CRN_PACKAGE_PATH = event.packagePath; //设置资源加载的路径
  }
  if (event && event.moduleId) {
    mainComponent = require(event.moduleId);
    if (_component) {
      _component.setState({ trigger: true });
      _component = null;
    }
  }
});
```

## 7. CRN中的懒加载
- 上面提到的内联引用其实也是懒加载的一中，CRN自身也实现了一套，源码如下
- [CRN对lazyRequire的介绍](https://github.com/ctripcorp/CRN/blob/master/resources/lazyRequire.md)
```javascript
/**
 * lazyRequire
 */
global.lazyRequire = lazyRequire;
function lazyRequire(requirePath) {
    var lazy = {
        __lazyRequireFlag: true,
        __lazy_module_id__ : requirePath,
        load : function() {
            var module = global.__r(this.__lazy_module_id__);
            return module;
        }
    };
    return lazy;
}
```
# 三、CRN路由管理
## 1. 路由如何跳转
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/1c7cb1ce553c16d5b153cf1b4883745c.png#pic_center)

## 2. 如何维护路由表(猜测)
1. 每次跳转都会先判断要跳转的页面是否当前业务内，如果没有使用CRNURLHandle跳转到相应的业务
2. 在Native端本身也是有路由栈，这样在Back时可以返回到相应的业务内

