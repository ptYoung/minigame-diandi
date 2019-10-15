exports.main = function(args) {
    try {
        //  入口参数
        args = JSON.parse(args)
        console.log(args)

        const myOpenid = wx.getOpenId(); //  发起者
        const toOpenid = args.toUser; //  接收者
        const opNum = args.opNum; //  增加的数据
        const likeStorageKey = new Date().toDateString(); //  以天为单位作为 KEY
        const friendsStorage = wx.getFriendUserStorage([likeStorageKey]);
        const friendList = friendsStorage.user_item;

        let ret = false;

        console.log("myOpenid: " + myOpenid + " toOpenid: " + toOpenid + " opNum: " + opNum)
        console.log(likeStorageKey)
        console.log(friendsStorage)

        // 用户每天只能给同一个好友赠送一次金币,每天最多送5次
        const friendData = friendList.find(item => item.openid === toOpenid); //  接收者数据
        const myData = friendList.find(item => item.openid === myOpenid); //  发起者数据
        if (friendData) {
            const friendKVData = friendData.kv_list[friendData.kv_list.length - 1]; //  接收者的点赞记录
            const myKVData = myData.kv_list[myData.kv_list.length - 1]; //  发起者的点赞记录

            let friendRecord = friendKVData && friendKVData.value ? JSON.parse(friendKVData.value) : {
                receiveRecords: [],
                likeCount: 0
            };
            let myRecord = myKVData && myKVData.value ? JSON.parse(myKVData.value) : {
                receiveRecords: [],
                likeCount: 0
            };

            console.log(friendRecord)
            console.log(myRecord)

            //  金币重复送给同一个人
            //  从接收者的被点赞历史记录中查找我的openid
            const toSameOne = friendRecord && friendRecord.receiveRecords.some(item => {
                return item.fromOpenid === myOpenid
            })

            //  点赞次数超过每日限制
            const outPerDayLimit = myRecord && myRecord.likeCount >= 5;

            console.log("toSameOne: " + toSameOne + " outPerDayLimit: " + outPerDayLimit)
            //  校验
            if (!(toSameOne || outPerDayLimit)) {
                //  在接收者的被点赞历史记录中加上一笔
                friendRecord.receiveRecords.push({
                    fromOpenid: myOpenid,
                    nickname: myData.nickname,
                    avatarUrl: myData.avatarUrl
                })
                //  发起者的点赞次数加上opNum 
                myRecord.likeCount = myRecord.likeCount + opNum;
                //  保存接收者的数据
                let ret1 = wx.setFriendUserStorage(toOpenid, [{
                    key: likeStorageKey,
                    value: JSON.stringify(friendRecord)
                }])
                //  保存发起者的数据
                let ret2 = wx.setFriendUserStorage(myOpenid, [{
                    key: likeStorageKey,
                    value: JSON.stringify(myRecord)
                }])

                console.log(ret1, ret2)

                if (ret1.errcode === 0 && ret2.errcode === 0) {
                    ret = true;
                }
            }

        }

        if (ret) {
            return JSON.stringify({
                "ret": true
            });
        } else {
            return JSON.stringify({
                "ret": false
            });
        }


    } catch (err) {
        console.error(err.message);
    }
}