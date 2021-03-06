cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        
    },
    
    calculateStory: function (chapterData, playerData) {
        var res = [];
        for (var i = 0; i < chapterData.start.length; i ++) {
            var _data = chapterData.start[i];
            res.push({type: "talk", name: _data.name, content: _data.content});
        }
        var speedList = [];
        var aliveHeroIdList = [];
        var aliveEnemyIdList = [];
        var playerList = [];
        for (var i = 0; i < chapterData.players.length; i ++) {
            var player = chapterData.players[i];
            if (player == null) {
                playerList.push(null);
                continue;
            }
            var data = playerData[player];
            playerList.push({
                attack: data.attack,
                totHP: data.blood,
                nowHP: data.blood,
            });
            speedList.push({id: i, speed: data.speed});
            if (i < 6) aliveHeroIdList.push(i);
            else aliveEnemyIdList.push(i);
        }
        speedList = speedList.sort((a, b)=>{ return b.speed - a.speed; });
        // if fight more than 30 loops , then lose
        var fightResult = 0;    // 1: win; -1: lose
        for (var fightTime = 0; fightTime < 30; fightTime ++) {
            var list = [];
            for (var i = 0; i < speedList.length; i ++) {
                list.push(speedList[i]);
            }
            for (var i = 0; i < list.length; i ++) {
                var id = list[i].id;
                if (id < 6) {   // hero attack enemy
                    if (aliveHeroIdList.indexOf(id) == -1) {
                        continue;
                    }
                    var enemyId = aliveEnemyIdList[Math.floor(Math.random() * aliveEnemyIdList.length)];
                    var enemyData = playerList[enemyId];
                    var damage = Math.floor(playerList[id].attack * (0.8 + 0.3 * Math.random()));
                    var heatDead = false;
                    if (damage > enemyData.nowHP) {
                        damage = enemyData.nowHP;
                        heatDead = true;
                    }
                    res.push({type: "attack", s: id, t: enemyId, damage: damage});
                    enemyData.nowHP -= damage;
                    res.push({type: "injured", id: enemyId, nowHP: enemyData.nowHP, totHP: enemyData.totHP});
                    if (heatDead) {
                        res.push({type: "dead", id: enemyId});
                        playerList[enemyId] = null;
                        var newList = [];
                        aliveEnemyIdList.forEach((_id)=>{
                            if (_id != enemyId)
                                newList.push(_id);
                        });
                        aliveEnemyIdList = newList;
                        if (aliveEnemyIdList.length <= 0) {
                            fightResult = 1;
                            break;
                        }
                    }
                    else {
                        playerList[enemyId] = enemyData;
                    }
                }
                else {          // enemy attack hero
                    if (aliveEnemyIdList.indexOf(id) == -1) {
                        continue;
                    }
                    var heroId = aliveHeroIdList[Math.floor(Math.random() * aliveHeroIdList.length)];
                    var heroData = playerList[heroId];
                    var damage = Math.floor(playerList[id].attack * (0.8 + 0.3 * Math.random()));
                    var heatDead = false;
                    if (damage > heroData.nowHP) {
                        damage = heroData.nowHP;
                        heatDead = true;
                    }
                    res.push({type: "attack", s: id, t: heroId, damage: damage});
                    heroData.nowHP -= damage;
                    res.push({type: "injured", id: heroId, nowHP: heroData.nowHP, totHP: heroData.totHP});
                    if (heatDead) {
                        res.push({type: "dead", id: heroId});
                        playerList[heroId] = null;
                        var newList = [];
                        aliveHeroIdList.forEach((_id)=>{
                            if (_id != heroId)
                                newList.push(_id);
                        });
                        aliveHeroIdList = newList;
                        if (aliveHeroIdList.length <= 0) {
                            fightResult = -1;
                            break;
                        }
                    }
                    else {
                        playerList[heroId] = heroData;
                    }
                }
            }
            
            if (fightResult != 0) {
                break;
            }
        }
        if (fightResult > 0) {  // win
            for (var i = 0; i < chapterData.win.length; i ++) {
                var data = chapterData.win[i];
                res.push({type: "talk", name: data.name, content: data.content});
            }
            res.push({type: "end", exp: chapterData.exp});
        }
        else {                  // lose
            for (var i = 0; i < chapterData.lose.length; i ++) {
                var data = chapterData.lose[i];
                res.push({type: "talk", name: data.name, content: data.content});
            }
            res.push({type: "end", exp: 0});
        }
        
        return res;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
