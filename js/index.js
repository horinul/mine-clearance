//面向对象思想
function Mine(tr,td,mineNum){
    this.tr=tr;//行数
    this.td=td;//列数
    this.mineNum=mineNum;//雷的总数

    this.squares=[];//存储所有方块的信息，二维数组，以行列的信息存储
    this.tds=[];//存储所有单元格的DOM对象(二维数组)
    this.surplusMine=mineNum;//剩余雷的数量
    this.allRight=false;//玩家标注的小红旗是否全是雷，判断是否游戏成功

    this.parent=document.getElementById('gameBox');

}


Mine.prototype.init=function(){
    var rn=this.randomNum();//雷的位置
    var n=0;//作为访问随机数字的位置的索引,即rn的索引
    for(var i=0;i<this.tr;i++){
        this.squares[i]=[];
        for(var j=0;j<this.td;j++){
            n++;//取方块在数组里的数组用行与列的方式去取，取方块周围对应的数字用坐标
            if(rn.indexOf(n)!=-1){
                this.squares[i][j]={type:'mine',x:j,y:i};
            }else{
                this.squares[i][j]={type:'number',x:j,y:i,value:0};
            }
        }
    }
    this.update();
    this.createDom();
    this.parent.oncontextmenu=function(){
        return false;
    }
    // this.mineNumDom=document.getElementsByClassName('mineNum');
    // this.mineNumDom.innerHTML=this.surplusMine;
    $('.mineNum').html(this.surplusMine);//出bug,用原生无法显示,未解决

}
Mine.prototype.randomNum=function(){
    var square=new Array(this.td*this.tr);
    for(var i=0;i<square.length;i++){
        square[i]=i;
    }
    square.sort(function(){return 0.5-Math.random()});
    return square.slice(0,this.mineNum);
}
Mine.prototype.createDom=function(){
    var This=this;
    var table=document.createElement('table');
    for(var i=0;i<this.tr;i++){//行
        var domTr=document.createElement('tr');
        this.tds[i]=[];
        
        for(var j=0;j<this.td;j++){//列
            var domTd=document.createElement('td');
            domTd.pos=[i,j];//存储对应的位置，行与列
            domTd.onmousedown=function(){
                This.play(event,this);//This 实例对象 this 被点击的Td
            }
            this.tds[i][j]=domTd;
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML="";
    this.parent.appendChild(table);
}
//找某个格子周围的八个格子
Mine.prototype.getAround=function(square){
    var x=square.x;
    var y=square.y;
    var result=[];//把找到的格子（雷以外的）的坐标返回【二维数组】
    //x坐标的值从x-1到x+1，y类似
    //坐标循环九宫格(坐标)
    for(var i=x-1;i<=x+1;i++){
        for(var j=y-1;j<=y+1;j++){
            //排除整个棋盘四个角的误差值+自身+八个格子中有雷
            if(i<0||j<0||i>this.td-1||j>this.tr-1||(i==x&&j==y)||this.squares[j][i].type=='mine'){
                continue;
            }
            result.push([j,i]);//返回行与列的形式
        }
    }
    return result;
}
//更新所有数字
Mine.prototype.update=function(){
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            //更新的只有雷周围的数字
            if(this.squares[i][j].type=='number'){
                continue;
            }
            var num=this.getAround(this.squares[i][j]);//获取雷周围的数组
            for(var k=0;k<num.length;k++){
                this.squares[num[k][0]][num[k][1]].value+=1;
            }
        }
    }
}

Mine.prototype.play=function(ev,obj){
    var This=this;
    if(ev.which==1 && obj.className!='flag'){//鼠标点击的时左键
        //且在立了小红旗之后不能再点击左键，只能右键取消了之后才可再次点击左键
    var curSquare=this.squares[obj.pos[0]][obj.pos[1]];
    console.log(curSquare)
    var cl=['zero','one','two','three','four','five','six','seven','eight'];
    if(curSquare.type=='number'){
        obj.innerHTML=curSquare.value;
        obj.className=cl[curSquare.value];

        //处理零的情况
        if(curSquare.value==0){
            obj.innerHTML='';

            function getAllZero(square){
                var around=This.getAround(square);
                for(var i=0;i<around.length;i++){
                    var x=around[i][0];//行
                    var y=around[i][1];//列
                    This.tds[x][y].className=cl[This.squares[x][y].value];
                    //递归 1.显示自身 2.找四周 然后重复
                    if(This.squares[x][y].value==0){
                        //给遍历过的格子加属性降低资源浪费
                        if(!This.tds[x][y].check){
                            This.tds[x][y].check=true;
                            getAllZero(This.squares[x][y]);
                        }
                    }else{
                        //某个格子为中心查找到的值不为零，则显示
                        This.tds[x][y].innerHTML=This.squares[x][y].value;
                    }
                }
            }

            getAllZero(curSquare);
        }
    }else{
        this.gameOver(obj);
    }}
    //用户点击的是右键
    if(ev.which==3){
        //如果右击的是数字，忽略
        if(obj.className&&obj.className!='flag'){
            return;
        }
        obj.className=obj.className=='flag'?'':'flag';//切换小旗
        if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
            this.allRight=true;
        }else{
            this.allRight=false;
        }
        //小旗的添加和减少
        if(obj.className=='flag'){
            $('.mineNum').html(--this.surplusMine);
        }else{
            $('.mineNum').html(++this.surplusMine);
        }
        if(this.surplusMine==0){
            if(this.allRight){
                alert('win');
            }else{
                alert('lose');
                this.gameOver;
            }
        }
    }
}
//定义游戏失败
Mine.prototype.gameOver=function(clickTd){
    //1.显示所有的雷
    //2.取消所有格子点击事件
    //3.给点中的格子标红
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine';
            }
            this.tds[i][j].onmousedown=null;
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor="white";
    }
    alert('lose');
}
// var mine=new Mine(28,28,99);
// mine.init();


//button功能实现
var btns=document.querySelectorAll('#level button');
var mine=null;//存储生成的实例
var ln=0;//处理当前选中的状态
var arr=[[9,9,10],[16,16,40],[28,28,99]];//行数列数雷数的二维数组
for(let i=0;i<btns.length-1;i++){
    btns[i].onclick=function(){
        btns[ln].className="";
        this.className="active";
        mine=new Mine(...arr[i]);//扩展运算符...  直接放arr[i]取不出来。要写成arr[i][0],arr[i][1]
        mine.init();
        ln=i;
    }
}
btns[0].onclick();//初始化
btns[3].onclick=function(){
    mine.init();
}









