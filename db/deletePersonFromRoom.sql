delete from Room where personalId = $1 and roomid = $2;
delete from People where personalId = $1;