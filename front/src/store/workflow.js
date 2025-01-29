import cheaterStatus from '/public/config/cheaterStatus.json';
import i18n from "../i18n";

const columnNames = cheaterStatus.child.map(i => ({
    value: i.value,
    label: i18n.t(`basic.status.${i.value}.text`)
}));

let data = {
    type: 'container',
    children: generateItems(columnNames.length, i => ({
        id: `column${i}`,
        type: 'container',
        name: columnNames[i],
        children: [],
    }))
};

/**
 * 生成列-卡片
 * @param count
 * @param creator
 * @returns {*[]}
 */
function generateItems(count, creator) {
    const result = []
    for (let i = 0; i < count; i++) {
        result.push(creator(i))
    }
    return result
}

export default {
    state: {
        $desktop: {
            // 工作流
            workflow: {
                config: {},                     // 工作流配置
                data,                           // 工作流队列
                autoUpdatePlayerLoading: true,  // 数据指示器
                autoUpdatePlayerList: {         // 数据
                    result: [],
                    total: 0
                }
            },
        },
    },
}
