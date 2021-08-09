# 迁移脚本

## 务必按照以下步骤依次进行！！！

1. 迁移被举报账号 `migration_cheaters.js`
2. 迁移用户 `migration_users.js`
3. 迁移举报 `migration_reports.js`
4. 迁移评论 `migration_replies.js`
5. 迁移判定#1 `migration_verify.js`
6. 迁移判定#2 `migration_confirm.js`
7. 重整评论 `migration_COMMENT.js`

## 它改了什么

1. 删除了`originUserId`错误的被举报账号
2. 没有动用户
3. 所有举报内容全部进行xss过滤，`cheatMethods`重整
4. 迁移评论先损失了回复某个楼的结构，所有评论内容全部进行xss过滤
5. 旧判定`verify`归为`judgement`，`cheatMethods`重整，内容进行xss过滤
6. 旧判定`confirm`归为`judgement`
7. 重整评论重新建立评论回复楼结构，可能会删除掉回复不存在人/不存在楼的回复楼结构