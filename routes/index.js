var express = require('express');
var router = express.Router();
var fs=require("fs");
var path=require("path");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var parse=require("parse");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("../public/database.db");
var multer = require('multer');//处理上传文件的模块
var promise=require("bluebird");
var async = require('async');
var url=require("url");
var jpeg=require("jpeg-js");//编解码jpg图片的模块
var bmp=require("bmp-js");//编解码bmp图片的模块

var upload_fileID,upload_date;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(typeof(req.body));
    console.log(req.body);
    cb(null, '../public/assets')
  },
  filename: function (req, file, cb) {
    var time=Date.now();
    var time2=new Date();
    upload_fileID=time;
    console.log(req.body);
    upload_fileID=upload_fileID.toString();
    console.log("fileID:"+upload_fileID);

    var fileFormat = (file.originalname).split(".");
    fileFormat=fileFormat[fileFormat.length - 1];

    upload_date=time2.toString();
    console.log("upload_date:"+upload_date);
    cb(null,upload_fileID+"."+fileFormat);
  }
});//将文件保存到服务器，并且插入记录到数据库中
var upload = multer({ storage: storage });
var cpUpload = upload.fields([ { name: 'file', maxCount: 1 }]);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render("login.jade");
});

router.post('/',function(req,res,next){
  var id=req.body.id;
  var pw=req.body.pw;
  //检测用户是否存在
  console.log(req.body);
  findNameById(id).then(function(results){
    if(results!=""){
      var status=results[0].status;
      login(id,pw).then(function(results){
        realpw=results[0].pw;
        if(pw==realpw&&status==1) {
          res.cookie("user", {id: id}, {maxAge: 900000, httpOnly: true});
          res.redirect("/homepage?id="+id);
          console.log("成功登录");
        }
        else if(pw==realpw&&status==0){
          res.render("login.jade", {status: -2});//用户处于BLOCK状态，无法登陆
        }
        else {
          res.render("login.jade", {status: -1});//登录失败
          console.log("登录失败");
        }
      });
    }
    else
      res.render("login.jade", {status: -3});//用户不存在
  });
});//登录

function login(id,pw) {
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    db.all("SELECT pw FROM users where id=" + id + "", function (err, rows) {
      if(!err&&rows!=""){
        rows.forEach(function (row) {
          re[count++]=row;
          resolve(re);
        });
      }
      else if(!err)
        resolve(re);
      else(reject(err));
    });
  });
}

router.get('/homepage', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;

  if(info){
    var id=info.id;
    var name=info.name;
    console.log(id);
    res.render('homepage.jade',{id:id});
  }
  else
    res.render("homepage.jade");
});

router.post('/homepage', function(req, res, next){
  console.log(req.body.wd);
  res.redirect("/select?wd="+req.body.wd);
});

router.get('/register', function(req, res, next) {
  res.render('register.jade');
});
router.post('/register', function(req,res,next){
  console.log(req.body);
  var id=req.body.id;
  var name=req.body.name;
  var pw=req.body.pw;
  findNameById(id).then(function(results){
    if(results==""){
      console.log("id="+id+"name="+name+"pw"+pw);
      var status=register(id,name,pw);
      console.log("status="+status);
      if(status==1){//成功注册
        res.cookie("user",{id:id},{ maxAge: 900000, httpOnly:false });
        res.redirect("/homepage");
      }
    }
    else
      res.render("register.jade",{status:-1});
  });
});//注册

function register(id,name,pw){
    var stmt = db.prepare("INSERT INTO users (id, name,pw,status) VALUES (?,?,?,?)");
    stmt.run(id, name, pw,1);
    stmt.finalize();
    return 1;
}

router.get('/communityvideo', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;

  if(info)
  {
    console.log(id);
    var id=info.id;
    var type=[];
    type[0]=7;
    type[1]=8;
    readFileByType(type).then(function(results) {
      catalog = results;
      res.render('communityvideo.jade', {catalog: catalog,id:id});
  });}
  else
    res.redirect("/");
});

router.get('/communityimage', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;

  if(info)
  {
    console.log(id);
    var id=info.id;
    var type=[];
    type[0]=3;
    type[1]=4;
    readFileByType(type).then(function(results) {
      catalog = results;
      res.render('communityimage.jade', {catalog: catalog,id:id});
    });}
  else
    res.redirect("/");
});

router.get('/communitytext', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;

  console.log(info);
  if(info)
  {
    var id=info.id;
    console.log(id);
    var type=[];
    type[0]=1;
    type[1]=2;
    readFileByType(type).then(function(results) {
      catalog = results;
      res.render('communitytext.jade', {catalog: catalog,id:id});
    });}
  else
    res.redirect("/");
});

router.get('/communityaudio', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;

  if(info)
  {
    var id=info.id;
    console.log(id);
    var type=[];
    type[0]=5;
    type[1]=6;
    readFileByType(type).then(function(results) {
      catalog = results;
      res.render('communityaudio.jade', {catalog: catalog,id:id});
  });}
  else
    res.redirect("/");
});

function waterMarkingJPG(fileID,userID) {
  var image1=readImage("../public/assets/"+fileID);
  var pixel1;
  var length1;
  var width1=image1.width;
  var height1=image1.height;
  //记录长宽信息
  var binaryID=userID.toString(2);
  var length3=binaryID.length;
  console.log(binaryID);

  var a;
  for(var i=0;i<9;i++) {
    a=parseInt(i/3)+i;
    if (i < 9 - length3)//0,1,2，补0
    {
      pixel1 = parseInt(image1.data[a].toString(2));//2进制字符串
      pixel1=pixel1.toString();
      length1 = pixel1.length;
      pixel1=pixel1.substring(0,length1-1)+0;
    }
    else {//3,4,5,6,8
      pixel1 = parseInt(image1.data[a].toString(2));
      pixel1=pixel1.toString();
      length1 = pixel1.length;
      pixel1=pixel1.substring(0,length1-1)+binaryID[i+length3-9];
    }
    pixel1 = parseInt(pixel1, 2);
    image1.data[a] = pixel1;
  }//9个数据最后一位存储ID

  console.log("加入水印后");
  console.log(image1.data);
  //编码成bmp图像
  var rawImageData = {
    width: width1,
    height: height1,
    data: image1.data
  };

  var bmpImageData = bmp.encode(rawImageData);
  fileID=fileID.split(".");
  console.log(fileID);
  console.log(typeof(fileID));
  fileID=fileID[0];
  fs.writeFile("../public/assets/"+fileID+".bmp", bmpImageData.data, {flag: 'a'}, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('写入成功');
    }
  });
}//水印制作：返回加入水印后的图像

function readImage(path){
  console.log(path);
  var jpegData=fs.readFileSync(path);
  console.log(jpegData);
  return jpeg.decode(jpegData);
}//读取jpeg格式的图片

function readFileByType(type){//通过type查找files表
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    var catalog=[];
    db.all("SELECT * FROM files where fileType=" + type[0] + " "+"or fileType="+type[1]+"", function (err, rows) {
      if(!err){
        if(rows=="")
          resolve(re);
        else
          {
          rows.forEach(function (row) {
            console.log("count="+count);
            re[count++]=row;
            resolve(re);
          });}
      }
      else(reject(err));
    });
  });
}

router.get('/personalcenter', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;
  if(info){
      if(ifAdmin(info.id)||ifLogin(arg.id,info.id)){
      var id=arg.id;
      findNameById(id).then(function(results){
        var name =results[0].name;
        console.log(id);
        if(id=="000000")
          //寻找用户信息
          findAllUsers().then(function(results){
            console.log(results);
            res.render('personalcenteradm.jade',{data:results});
          });
        else
          res.render('personalcenter.jade', {id:id,name:name});
      });
    }
  }
  else
    res.redirect("/");
});

router.post('/personalcenter', function(req, res, next) {
  var info=req.cookies.user;
  if(info){
    var aa=req.body;
    console.log(aa);
    userID=aa.id;
    action=aa.action;
    console.log(userID);
    if(ifAdmin(info.id)){
      if(action==1)//block用户
      {
        blockUser(userID);
        res.send("0");
      }
      else {
        unBlockUser(userID);
        res.send("1");
      }
    }
  }
  else
    res.redirect("/");
});

function blockUser(userID){
  console.log("block")
  db.run("update users set status=0 WHERE id = "+userID, function(err) {
    if (err) throw err;
  });
}

function unBlockUser(userID){
  console.log("unblock");
  db.run("update users set status=1 WHERE id = "+userID, function(err) {
    if (err) throw err;
  });
}

function findNameById(id){//通过id查找users表
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    db.all("SELECT * FROM users where id=" + id + "", function (err, rows) {
      if(!err&&rows!=""){
        console.log("rows="+rows);
        if(rows!=""){
          rows.forEach(function (row) {
            re[count++]=row;
            resolve(re);
          });
        }
      }
      else if(!err)
        resolve(re);
      else(reject(err));
    });
  });

}//通过id查找users表

function findAllUsers(){
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    db.all("SELECT * FROM users", function (err, rows) {
      if(!err&&rows!=""){
        rows.forEach(function (row) {
          re[count++]=row;
          resolve(re);
        });
      }
      else if(!err)
        resolve(re);
      else(reject(err));
    });
  });
}

function ifAdmin(id){
  return id == "000000";
}//判断是否是管理员

function ifLogin(urlID,cID){
  console.log(urlID);
  console.log(cID);
  if(urlID==cID)
    return true;
  else return false;
}//判断urlid与cookieid是否相符

router.get('/mediaplay',function(req,res,next){
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;
  if(info){
    var id=info.id;
    var fileID = arg.fid;
    var comments;
    findCommentsByID(fileID).then(function(results){
      comments=results;
      findFileNameByID(fileID).then(function (results) {
        console.log(results);
        var fileName = results[0].filename;
        var fileType=results[0].fileType;
        var userid=results[0].id;
        var description=results[0].abstract;
        var post=whichType(fileType);
        var src = "assets/" + fileID+ post;
        likeOrNot(id,fileID).then(function(results){
          var like;
          console.log(results);
          if(results=="")
            like="LIKE IT";
          else
            like="DISLIKE IT";
          res.render('mediaplay.jade', {src: src, id: id, fileName:fileName,comments:comments,like:like,fileType:fileType,userID:userid,description: description});
        });
      });
    });
  }
  else
    res.redirect("/");
});

function findFileNameByID(fileID){//通过fileID查找files
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    db.all("SELECT * FROM files where fileID=" + fileID + "", function (err, rows) {
      if(!err) {
        if (rows == "")
          resolve(re);
        else {
          rows.forEach(function (row) {
            re[count++] = row;
            resolve(re);
          });
        }
      }
      else(reject(err));
    });
  });



}//通过fileID查找files表

function findFileByUserID(userID){
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    db.all("SELECT * FROM files where id=" + userID + "", function (err, rows) {
      if(!err) {
        if (rows == "")
          resolve(re);
        else {
          rows.forEach(function (row) {
            re[count++] = row;
            resolve(re);
          });
        }
      }
      else(reject(err));
    });
  });

}//通过userID查找Files表

function findCommentsByID(songID) {
  var re = [];
  var count = 0;
  //console.log("test");
  return new promise(function (resolve, reject) {
    db.all("SELECT time,id,comment FROM comments where fileID=" + songID + "", function (err, rows) {
      if (!err) {
        if(rows==''){
          resolve(re);
        }
        else
          {
            rows.forEach(function (row) {
            //console.log("row");
           // console.log(row);
            re[count++] = row;
            resolve(re);
          });
        }
      }
      else(reject(err));
    });
  });
}//查找评论

function likeOrNot(id,fileID){
  //是否喜欢该文件
  var re = [];
  var count = 0;
  //console.log("test");
  return new promise(function (resolve, reject) {
    db.all("SELECT * FROM favlist where id=" + id + ' and ' +"fileID="+fileID + "", function (err, rows) {
      if (!err) {
        if(rows==''){
          resolve(re);
        }
        else
        {
          rows.forEach(function (row) {
            re[count++] = row;
            resolve(re);
          });
        }
      }
      else(reject(err));
    });
  });
}

router.post('/mediaplay', function(req, res, next) {//提交评论
  var info=req.cookies.user;
  if(info)
  {
    var id=info.id;
    console.log(req.body);
    var fileID=req.query.fid;
    console.log(fileID);
    //对数据库操作
    //更新

    if(req.body.flag=="submit"){
      var comment=req.body.comment;
      var time=new Date().toString();
      addComment(fileID,time,id,comment);
      var temp=[];
      temp.push({fileID: fileID,time:time,id:id, comment:comment});
      console.log("temp");
      console.log(temp);
      res.send(temp);
    }
    else if(req.body.flag=="like"){//flag==like
      likeIt(id,fileID);
      res.send("1");
      //计入数据库
    }
    else if(req.body.flag=="dislike"){
      dislikeIt(id,fileID);
      res.send("1");
    }
    else if(req.body.flag=="delete"){
      findFileNameByID(fileID).then(function(results){
        var tmpid=results[0].id;
        if(tmpid==id||id=="000000") {
          //对数据库进行操作
		        deleteFile(fileID);
          res.send("1");//删除成功
        }
        else
          res.send("0");//没有权限删除
      });
    }
  }
  else
    res.redirect("/");
});

function deleteFile(fileID){
  db.run("DELETE FROM files WHERE fileID = "+fileID, function(err) {
    if (err) throw err;
    console.log(fileID);
  });
  db.run("DELETE FROM favlist WHERE fileID = "+fileID, function(err) {
    if (err) throw err;
    console.log("删除favlist成功");
  });
  db.run("DELETE FROM comments WHERE fileID = "+fileID, function(err) {
    if (err) throw err;
    console.log("删除comments成功");
  });
}

function addComment(fileID,time,id,comment){
  var stmt = db.prepare("INSERT INTO comments (fileID,time,id,comment) VALUES (?,?,?,?)");
  stmt.run(fileID,time,id,comment);
  stmt.finalize();
  console.log("向数据库中添加评论成功");
}

function likeIt(userID,fileID){
  var stmt = db.prepare("INSERT INTO favlist (id,fileID) VALUES (?,?)");
  stmt.run(userID,fileID);
  stmt.finalize();
  console.log("向数据库中添加喜欢成功");

}

function dislikeIt(userID,fileID){
  var stmt = db.prepare("delete from favlist where id=? and fileID=?");
  stmt.run(userID,fileID);
  stmt.finalize();
  console.log("向数据库中删除喜欢成功");
}

function whichType(type){
  if(type=="1")
    return ".txt"
  else if(type=="2")
    return ".doc";
  else if(type=="3")
    return ".bmp";
  else if(type=="4")
    return ".bmp";
  else if(type=="5")
    return ".mp3";
  else if(type=="6")
    return ".wav";
  else if(type=="7")
    return ".mp4";
  else
    return ".avi";
}

router.get('/filelistfav', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;
  var id=arg.id;
  if(ifLogin(id,info.id)||ifAdmin(info.id)){
    // console.log(id);
    var comments;
    //找到歌名
    findFileFav(id).then(function(results){
      console.log(results);
      res.render('filelistfav.jade',{id:id,catalog:results});
    });
  }
  else
    res.redirect("/");
});

function findFileFav(userID){
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    db.all("SELECT id,fileID,fileType,fileName FROM favlist natural join files where id=" + userID + "", function (err, rows) {
      if(!err) {
        if (rows == "")
          resolve(re);
        else {
          rows.forEach(function (row) {
            re[count++] = row;
            resolve(re);
          });
        }
      }
      else(reject(err));
    });
  });
  

  
  
}//根据用户ID查找喜欢的文件

router.get('/filelistup', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;
  var id=arg.id;
  if(info){
    if(ifLogin(id,info.id)||ifAdmin(info.id)){
      console.log(id);
      findFileByUserID(id).then(function(results){
        console.log(results);
        res.render('filelistup.jade',{id:id,catalog:results});
      });
    }
  }
  else
    res.redirect("/");
});

router.get('/upload', function(req, res, next) {
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;
  if(info){
    if(ifLogin(arg.id,info.id)){
      var id=info.id;
      res.render('upload.jade',{id:id});
    }
  }
  else
    res.redirect("/");

});

router.post('/upload',cpUpload,function(req,res,next){
  var info=req.cookies.user;
  var arg = url.parse(req.url, true).query;
  if(info){
    if(ifLogin(arg.id,info.id))
    {
      var id=info.id;
      var fileType=req.body.category;
      var filename=req.body.fileName;
      var abstract=req.body.description;
      console.log(upload_fileID+"-"+filename+"-"+upload_date+"-"+fileType+"-"+abstract);
      var status=addFile(upload_fileID,filename,upload_date,fileType,id,abstract);
      if(fileType==4)
      {
        waterMarkingJPG(upload_fileID+".jpg",id);
      }
      if(fileType==7||fileType==8){
        //getCover(upload_fileID)//提取视频封面
      }
      res.render("upload.jade",{status:status,id:id});
    }
  }
  else
    res.redirect("/");
});


function getCover(fileID){


}

function addFile(fileID,filename,upload_date,fileType,id,abstract){
  var stmt = db.prepare("INSERT INTO files (fileID, filename,upload_date,fileType,id, abstract) VALUES (?,?,?,?,?,?)");
  stmt.run(fileID,filename,upload_date,fileType,id,abstract);
  stmt.finalize();
  console.log("向数据库中添加记录成功");
  return 1;
}

function test(id) {
  var re=[];
  var count=0;
  return new promise(function (resolve, reject) {
    db.all("SELECT * FROM files where id=" + id + "", function (err, rows) {
      if(!err&&rows!=""){
      rows.forEach(function (row) {
        //console.log(row.id + ": " + row.fileID);
        re[count++]=row;
        //console.log(count);
        resolve(re);
      });
      }
      else if(!err)
        resolve(re);
      else(reject(err));
    });
  });
}

router.get('/logout', function (req,res,next){
  console.log("logout");
  res.clearCookie('user');
  res.redirect('/');
});//注销

router.get("/select",function(req,res,next){
  var arg = url.parse(req.url, true).query;
  var select=arg.wd;
  console.log(select);
  var info=req.cookies.user;
  if(info){
    if(select!=""){
      selectByFileName(select).then(function(results){
        console.log(results);
        res.render("select.jade",{catalog:results,id:info.id});
      });
    }
    else
      res.render("select.jade");
  }
  else
    res.redirect("/");
});

router.post("/select",function(req,res,next) {
  var catalog;
  var select=req.body.wd;
  console.log(select);
  var info=req.cookies.user;
  if(info){
    if(select!=""){
      selectByFileName(select).then(function(results){
        console.log(results);
        res.send(results);
      });
    }
    else
      res.send("/")
  }
});

function selectByFileName(filename){
  var re=[];
  var count=0;
  var fname="%"+filename+"%";
  return new promise(function (resolve, reject) {
    db.all("SELECT * FROM files where filename like" +'"'+fname+'"', function (err, rows) {
      if(!err&&rows!=""){
        rows.forEach(function (row) {
          re[count++]=row;
          resolve(re);
        });
      }
      else if(!err)
        resolve(re);
      else(reject(err));
    });
  });
}//根据文件名查询

module.exports = router;
