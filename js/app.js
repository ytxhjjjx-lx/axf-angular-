// 添加路由模块
var app = angular.module('myApp', ['ngRoute'])
// 配置angular的路由
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: './views/home.html',
            controller: 'Home'
        })
        .when('/shansong', {
            templateUrl: './views/shansong.html',
            controller: 'ShanSong'
        })
        .when('/cart', {
            templateUrl: './views/cart.html',
            controller: 'Cart'
        })
        .when('/mine', {
            templateUrl: './views/mine.html',
            controller: 'Mine'
        })
        .when('/productDetail', {
            templateUrl: './views/productDetail.html',
            controller: 'productDetail'
        })
        // 用于上面的路由都未匹配上
        .otherwise({
            redirectTo: '/home'
        })
}])

//首页
app.controller('Home', ['$scope', '$http', 'CartService', function ($scope, $http, CartService) {
    //商品类型数据
    $scope.categorys = CartService.getHomeProducts()
    $scope.data = {}
    //只进行一次ajax请求
    if (!($scope.categorys.length > 0)) {
        $http.get('../home.json')
            .success(function (data) {
                $scope.data = data
                $scope.categorys1 = data.data.act_info[2].act_rows
                $scope.categorys2 = data.data.act_info[3].act_rows
                //五条数据
                $scope.newCategorys = $scope.categorys1.concat($scope.categorys2)
                $scope.categorys = $scope.newCategorys
                CartService.setHomeProducts($scope.newCategorys)
                // console.log($scope.categorys)
            })
    }
    //增加商品
    $scope.addNum = function (product) {
        CartService.addProduct(product)
    }
}])

//闪送超市页(注意:: 参数顺序)
app.controller('ShanSong', ['$scope', '$http', 'CartService', function ($scope, $http, CartService) {
    //子分类关键字
    $scope.cateKey = '全部分类'
    //排序关键字
    $scope.sortKey = '综合排序'
    //是否选中子分类
    $scope.childCateBol = false
    //是否进行排序
    $scope.sortBol = false
    // 排序的方式 
    $scope.rankings = [
        { name: '综合排序' },
        { name: '价格最高' },
        { name: '价格最低' }
    ]
    //激活分类对应子分类条目
    $scope.filterItems = []
    //默认不排序
    $scope.orderType = ''


    //商品类型数据
    $scope.categorys = CartService.getCategorys()

    if ($scope.categorys.length > 0) {
        $scope.categories = CartService.getCategorys()
        // 初始化激活的分类的id
        $scope.activeCateId = CartService.getCategorys()[0].id
        //所有商品数据
        $scope.products = CartService.getSsProducts()
    } else {
        $http.get('../categoryProducts.json')
            .success(function (data) {
                $scope.categorys = data.data.categories
                $scope.products = data.data.products
                $scope.activeCateId = data.data.categories[0].id
                CartService.setCategorys(data.data.categories)
                CartService.setSsProducts(data.data.products)
                // console.log($scope.products)
                // console.log($scope.categorys)
            })
    }

    //切换激活的分类id
    $scope.changeCategory = function (id) {
        $scope.activeCateId = id
        toNumber()
        //隐藏筛选条目
        $scope.childCateBol = $scope.sortBol = false
        //初始化关键字
        $scope.cateKey = '全部分类'
        $scope.sortKey = '综合排序'
        //更改为不排序
        $scope.orderType = ''
    }
    //进行子分类筛选
    $scope.changeCategoryBol = function () {
        $scope.childCateBol = !$scope.childCateBol
        $scope.sortBol = false
        for (var i = 0; i < $scope.categorys.length; i++) {
            if ($scope.categorys[i].id === $scope.activeCateId) {
                $scope.filterItems = $scope.categorys[i].cids
                break
            }
        }
    }
    //进行排序筛选
    $scope.changeRankingBol = function () {
        $scope.sortBol = !$scope.sortBol
        $scope.childCateBol = false
    }
    //隐藏筛选条目
    $scope.hideFilterItems = function () {
        $scope.childCateBol = $scope.sortBol = false
    }
    //更改筛选关键字
    $scope.filterProduct = function (product) {
        toNumber()
        //判断为排序还是分类
        if ($scope.childCateBol) {
            $scope.cateKey = product.name
            //排序
        } else {
            $scope.sortKey = product.name
            $scope.orderType = 'price'
            if ($scope.sortKey === '价格最高') $scope.orderBol = true
            if ($scope.sortKey === '价格最低') $scope.orderBol = false
        }
    }
    //根据激活子分类筛选
    $scope.cidFilter = function (product) {
        if ($scope.cateKey === '全部分类') {
            return true
        } else {
            return product.cids[product.child_cid] === $scope.cateKey
        }
    }


    //向购物车添加商品
    $scope.addNum = function (product) {
        CartService.addProduct(product)
    }
    //向购物车减少商品
    $scope.subNum = function (product) {
        CartService.subProduct(product)
    }


    //更改所有商品价格为number类型
    function toNumber() {
        for (var i = 0; i < $scope.products[$scope.activeCateId].length; i++) {
            $scope.products[$scope.activeCateId][i].price = Number($scope.products[$scope.activeCateId][i].price)
        }
    }
}])

//购物车页
app.controller('Cart', ['$scope', 'CartService', function ($scope, CartService) {
    //存放购物车商品数据
    $scope.cartData = CartService.getCartData()
    $scope.allCheckedBol = true
    //增加商品
    $scope.addNum = function (product) {
        CartService.addProduct(product)
    }
    //减少商品
    $scope.subNum = function (product) {
        CartService.subProduct(product)
    }
    //统计购物车所有商品的总价
    $scope.sumPrice = function () {
        var price = 0
        for (var i = 0; i < $scope.cartData.length; i++) {
            //只统计选中的商品价格
            if ($scope.cartData[i].checkedBol) {
                price += ($scope.cartData[i].pre_state * $scope.cartData[i].price)
            }
        }
        price = Number(price).toFixed(1)
        return price
    }
    //更改商品的选中状态
    $scope.changeCheckedBol = function (product) {
        product.checkedBol = !product.checkedBol
        isSelectAll()
    }
    //是否全选商品
    function isSelectAll() {
        for (var i = 0; i < $scope.cartData.length; i++) {
            if (!$scope.cartData[i].checkedBol) {
                $scope.allCheckedBol = false
                return
            }
        }
        $scope.allCheckedBol = true
    }
    //切换全选状态
    $scope.changeAllChecked = function () {
        $scope.allCheckedBol = !$scope.allCheckedBol
        for (var i=0; i<$scope.cartData.length; i++) {
            $scope.cartData[i].checkedBol = ($scope.allCheckedBol === true ? true : false)
        }
    }
    //判断是否可以下单
    $scope.allChecked = function () {
        //只要选择了一件商品就可以下单
        for (var i=0; i<$scope.cartData.length; i++) {
            if ($scope.cartData[i].checkedBol) {
                $scope.cartKey = '选好了'
                return true
            }
        }
        $scope.cartKey = '满0元起送'
        return false
    }
}])

//我的页
app.controller('Mine', ['$scope', function ($scope) {
}])

// 添加自定义服务
app.factory('CartService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    //存储首页商品数据
    var homeProducts = []
    //存放闪送超市页分类数据
    var ssCategorys = []
    //存放闪送超市页商品数据
    var ssProducts = {}
    //存放购物车数据
    var cartData = []

    //重置商品数量
    function sumProductNum() {
        var num = 0
        for (var i = 0; i < cartData.length; i++) {
            num += cartData[i].pre_state
        }
        //购物车商品数量
        $rootScope.productNum = num
        $rootScope.numTransform = true
        //购物车商品数量动画
        $timeout(function () {
            $rootScope.numTransform = false
        }, 200)
    }
    return {
        setHomeProducts: function (data) {
            homeProducts = data
        },
        getHomeProducts: function () {
            return homeProducts
        },
        setCategorys: function (data) {
            ssCategorys = data
        },
        getCategorys: function () {
            return ssCategorys
        },
        setSsProducts: function (data) {
            ssProducts = data
        },
        getSsProducts: function () {
            return ssProducts
        },
        getCartData: function () {
            return cartData
        },
        // 增加商品数量
        addProduct: function (item) {
            //是否需要添加商品
            var addBol = true
            for (var i = 0; i < cartData.length; i++) {
                if (cartData[i].id === item.id) {
                    cartData[i].pre_state++
                    addBol = false
                    break
                }
            }
            if (addBol) {
                item.pre_state++
                item.checkedBol = true
                cartData.push(item)
            }
            sumProductNum()
        },
        // 减少商品数量
        subProduct: function (item) {
            for (var i = 0; i < cartData.length; i++) {
                if (cartData[i].id === item.id) {
                    cartData[i].pre_state--
                    if (cartData[i].pre_state <= 0) {
                        cartData.splice(i, 1)
                    }
                    break
                }
            }
            sumProductNum()
        }
    }
}])
