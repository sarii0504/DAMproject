//var script=document.createElement("script");
//script.setAttribute("src","/javascripts/json2.js");
//document.body.appendChild(script);

function getImageFile(){
  var catalog = document.getElementById("imagecatalog").innerText;
  catalog = JSON.parse(catalog);
  for (var i = 0; i < catalog.length; i++) {
    var fileType = catalog[i].fileType;
    var fileID = catalog[i].fileID;
    var fileName=catalog[i].filename;
    if(fileType==3)
      post=".bmp";
    if(fileType==4)
      post=".bmp";
    var a = document.createElement("a");
    a.setAttribute("href", "mediaplay?fid=" + fileID);
    a.className = "border";

    var span=document.createElement("span");
    span.className="image.fit";
    a.appendChild(span);
    var img=document.createElement("img");
    img.setAttribute("src","assets/"+fileID+post);
    img.className="img";
    span.appendChild(img);
    var p=document.createElement("p");
    p.innerText=fileName;
    span.appendChild(p);
    p.className="center";
    document.getElementById("imageBox").appendChild(a);
  }
}

function getVideoFile(){
  var catalog = document.getElementById("videocatalog").innerText;
  catalog = JSON.parse(catalog)
  for (var i = 0; i < catalog.length; i++) {
    var fileName = catalog[i].filename;
    var fileID = catalog[i].fileID;
    var a = document.createElement("a");
    a.setAttribute("href", "mediaplay?fid=" + fileID);
    a.className = ".4u";

    var span=document.createElement("span");
    span.className=".image.fit";
    a.appendChild(span);
    var img=document.createElement("img");
    img.setAttribute("src","assets/"+fileID+".jpg");
    img.className="img";
    span.appendChild(img);
    var p=document.createElement("p");
    p.innerText=fileName;
    span.appendChild(p);
    p.className="center";
    document.getElementById("videoCover").appendChild(a);
  }
}

function getTextFile(){
  var catalog = document.getElementById("textCatalog").innerText;
  catalog = JSON.parse(catalog);
  for (var i = 0; i < catalog.length; i++) {
    var fileType = catalog[i].fileType;
    var fileID = catalog[i].fileID;
    var fileName=catalog[i].filename;
    var a = document.createElement("a");
    a.setAttribute("href", "mediaplay?fid=" + fileID);
    a.className = ".textList";

    var li = document.createElement("li");
    li.innerText = fileName;
    a.appendChild(li);
    document.getElementById("textBox").appendChild(a);
  }
}

function getAudioFile(){
  var catalog = document.getElementById("audioBox").innerText;

  catalog = JSON.parse(catalog);

  for (var i = 0; i < catalog.length; i++) {
    var fileName = catalog[i].filename;
    var fileID = catalog[i].fileID;
    var a = document.createElement("a");
    a.setAttribute("href", "mediaplay?fid=" + fileID);
    a.className = "songList";

    var li = document.createElement("li");
    li.innerText = fileName;
    a.appendChild(li);
    document.body.appendChild(a);
  }
}

function sendComment(){
  var xmlhttp;
  var comment=document.getElementById("message").value;
  document.getElementById("message").value="";
  var fid=document.URL.split("=")[1];
  var record="comment="+comment+'&'+"flag=submit";
  if (window.XMLHttpRequest)
  {
    //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
    xmlhttp=new XMLHttpRequest();
  }
  else
  {
    // IE6, IE5 浏览器执行代码
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange=function()
  {
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
      var comments=xmlhttp.responseText;

      comments = JSON.parse(comments);
      var time = comments[0].time;
      var id = comments[0].id;
      var comment = comments[0].comment;

      var p = document.createElement("p");
      p.innerText = "用户ID:"+id+"||"+"评论:"+comment;
      p.className="center";
      var box=document.getElementById("commentBox");
      box.appendChild(p);
    }
  };
  xmlhttp.open("POST","/mediaplay/?fid="+fid,true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.send(record);
}

function showComments(){
  var comments = document.getElementById("comments").innerText;

  comments = JSON.parse(comments);
  for (var i = 0; i < comments.length; i++) {
    var time = comments[i].time;
    var ID = comments[i].id;
    var comment = comments[i].comment;
    var p = document.createElement("p");

    p.innerText = "用户ID:"+ID+"||"+"评论:"+comment;
    p.className = "center";

    var box = document.getElementById("commentBox");
    box.appendChild(p);
  }
}

function likeIt(){
  var xmlhttp;
  var fid=document.URL.split("=")[1];
  var flag=document.getElementById("likeBtn").innerText;
  var req;
  if (window.XMLHttpRequest)
  {
    //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
    xmlhttp=new XMLHttpRequest();
  }
  else
  {
    // IE6, IE5 浏览器执行代码
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  if(flag=="LIKE IT"){
    xmlhttp.onreadystatechange=function()
    {
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
      {
        document.getElementById("likeBtn").innerText="DISLIKE IT";
        alert("收藏成功")
      }
    };
    req="flag=like";
    xmlhttp.open("POST","/mediaplay/?fid="+fid,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send(req);
  }
  if(flag=="DISLIKE IT"){
    xmlhttp.onreadystatechange=function()
    {
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
      {
        document.getElementById("likeBtn").innerText="LIKE IT";
        alert("删除收藏成功")
      }
    };
    req="flag=dislike";
    xmlhttp.open("POST","/mediaplay/?fid="+fid,true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send(req);
  }

}

function deleteIt(id){
  var xmlhttp;
  var fid=document.URL.split("=")[1];//文件编号

  var req;
  if (window.XMLHttpRequest)
  {
    //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
    xmlhttp=new XMLHttpRequest();
  }
  else
  {
    // IE6, IE5 浏览器执行代码
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange=function()
  {
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
      var status=xmlhttp.responseText;
      if(status==1)//是该用户上传的
      { window.location.href='/homepage';
        alert("成功删除");
      }
      else
        alert("没有权限删除");
    }
  };
  req="flag=delete";
  xmlhttp.open("POST","/mediaplay/?fid="+fid,true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.send(req);
}

function showText(){
  var src=document.getElementById("textSrc").innerText;
  var data;
  $(function(){
    $.ajax({
      url: src,
      dataType: 'text',
      success: function(data) {
        document.getElementById("test3").innerText=data;//HTML没有保留格式，Text保留格式
      }
    });
  });

}

function getFavFile(){
  var catalog = document.getElementById("favCatalog").innerText;
  catalog = JSON.parse(catalog);
  formCatalog(catalog);
}

function getUploadFile(){

  var catalog = document.getElementById("upCatalog").innerText;
  catalog = JSON.parse(catalog);
  formCatalog(catalog);
}

function userInfo() {

  var catalog = document.getElementById("data").innerText;
  catalog = JSON.parse(catalog);

  for (var i = 0; i < catalog.length; i++) {
    var id = catalog[i].id;
    if(id!==0) {
      var status=catalog[i].status;
      var name = catalog[i].name;
      var td1 = document.createElement("td");
      var td2 = document.createElement("td");
      var td3 = document.createElement("td");
      td2.innerText = name;

      var a=document.createElement("a");
      a.setAttribute("href","personalcenter?id="+id);//进入用户主页
      a.innerText=id;
      td1.appendChild(a);
      var input = document.createElement("input");
      input.id = id;
      input.setAttribute("name", id);
      input.setAttribute("onclick", "blockUser(id)");
      input.className="button";
      if(status==1)
        input.setAttribute("value","BLOCK");
      else
        input.setAttribute("value","UNBLOCK");

      td3.appendChild(input);
      var tr = document.createElement("tr");
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      document.getElementById("userInfo").appendChild(tr);
    }
  }
}

function selectFile(){
  var xmlhttp;
  var textInput=document.getElementById("textInput").value;//查询条件
  if (window.XMLHttpRequest)
  {
    //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
    xmlhttp=new XMLHttpRequest();
  }
  else
  {
    // IE6, IE5 浏览器执行代码
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange=function()
  {
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
      var catalog=xmlhttp.responseText;
      catalog = JSON.parse(catalog);
      formCatalog(catalog);
      history.pushState(textInput,"", "select?wd="+textInput);
      window.onpopstate = function(event) {
        str=JSON.stringify(event.state);
        str=str.substring(1,(str.length-1));
        document.getElementById("textInput").value=str;//查询条件
        selectFile();
      };
    }
  };
  var req="wd="+textInput;
  xmlhttp.open("POST","/select",true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.send(req);
}//查询按钮点击触发

function openSelect(){
  var catalog = document.getElementById("Catalog").innerText;
  catalog = JSON.parse(catalog);

  formCatalog(catalog);
}//打开网页时加载

function blockUser(id){
  var xmlhttp;

  if (window.XMLHttpRequest)
  {
    //  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
    xmlhttp=new XMLHttpRequest();
  }
  else
  {
    // IE6, IE5 浏览器执行代码
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange=function()
  {
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
      var status=xmlhttp.responseText;
      if(status==1)//是该用户上传的
      { //更改label的值
        document.getElementById(id).value="BLOCK";
        alert("UNBLOCK成功");
      }
      else {
        document.getElementById(id).value = "UNBLOCK";
        alert("BLOCK成功");
      }
    }
  };

  if(document.getElementById(id).value=="BLOCK")
    action=1;//block()
  else
    action=0;

  var req="id="+id+'&'+"action="+action;
  xmlhttp.open("POST","/personalcenter",true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.send(req);

}

function formCatalog(catalog){
  //先清除所有元素
  document.getElementById("Text").innerHTML='';
  for (var i = 0; i < catalog.length; i++) {
    var fileType = catalog[i].fileType;
    var fileID = catalog[i].fileID;
    var fileName=catalog[i].filename;
    if(fileType==1||fileType==2)
    {
      a = document.createElement("a");
      a.setAttribute("href", "mediaplay?fid=" + fileID);
      a.className = ".textList";
      var li = document.createElement("li");
      li.innerText = fileName;
      a.appendChild(li);
      document.getElementById("Text").appendChild(a);
    }
    else if(fileType==3||fileType==4)
    {
      if(fileType==3)
        post=".bmp";
      if(fileType==4)
        post=".bmp";
      a = document.createElement("a");
      a.setAttribute("href", "mediaplay?fid=" + fileID);
      a.className = ".border";

      span=document.createElement("span");
      span.className="image.fit";
      a.appendChild(span);
      img=document.createElement("img");
      img.setAttribute("src","assets/"+fileID+post);
      img.className="img";
      span.appendChild(img);
      p=document.createElement("p");
      p.innerText=fileName;
      span.appendChild(p);
      p.className="center";
      document.getElementById("Image").appendChild(a);
    }
    else if(fileType==5||fileType==6)
    {
      a = document.createElement("a");
      a.setAttribute("href", "mediaplay?fid=" + fileID);
      a.className = "songList";

      li = document.createElement("li");
      li.innerText = fileName;
      a.appendChild(li);
      document.getElementById("Audio").appendChild(a);
    }

    else{
      var a = document.createElement("a");
      a.setAttribute("href", "mediaplay?fid=" + fileID);
      a.className = ".4u";

      var span=document.createElement("span");
      span.className=".image.fit";
      a.appendChild(span);
      var img=document.createElement("img");
      img.className="img";
      img.setAttribute("src","assets/"+fileID+".jpg");
      span.appendChild(img);
      var p=document.createElement("p");
      p.innerText=fileName;
      span.appendChild(p);
      p.className="center";
      document.getElementById("Video").appendChild(a);
    }

  }
}