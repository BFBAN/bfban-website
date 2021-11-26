# 迁移脚本

## 务必按照以下步骤依次进行！！！

1. 迁移被举报账号 `migration_cheaters.js`
2. 迁移用户 `migration_users.js`
3. 迁移举报 `migration_reports.js`
4. 迁移评论 `migration_replies.js`
5. 迁移判定#1 `migration_verify.js`
6. 迁移判定#2 `migration_confirm.js`
7. 迁移被举报人origin名字记录 `migration_namelog.js`

## 它改了什么

1. 删除了`originUserId`错误的被举报账号
2. 没有动用户原数据，为用户加入自我介绍，附加信息等新属性
3. 所有举报内容全部进行xss过滤，`cheatMethods`重整
4. 所有评论内容全部进行xss过滤
5. 旧判定`verify`归为`judgement`，`cheatMethods`重整，内容进行xss过滤
6. 旧判定`confirm`归为`judgement`
7. 被举报人origin名字记录连续时间内相同ID合并，更新连续时间