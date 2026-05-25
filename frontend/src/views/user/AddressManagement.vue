<script setup>
import { ref, h, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { NBadge, NTag } from 'naive-ui'

import { useGlobalState } from '../../store'
import { api } from '../../api'

const { settings } = useGlobalState()
const message = useMessage()

const { t } = useI18n({
    messages: {
        en: {
            mailbox: 'Mailbox',
            mail_count: 'Mail Count',
            send_count: 'Send Count',
            current: 'Current',
        },
        zh: {
            mailbox: '邮箱',
            mail_count: '邮件数量',
            send_count: '发送数量',
            current: '当前',
        }
    }
});

const data = ref([])

const fetchData = async () => {
    try {
        const { results } = await api.fetch(`/user_api/bind_address`);
        data.value = results;
    } catch (error) {
        console.log(error)
        message.error(error.message || "error");
    }
}

const columns = [
    {
        title: t('mailbox'),
        key: "name",
        render(row) {
            return h('div', [
                h('span', row.name),
                settings.value.address === row.name ? h(NTag, {
                    size: 'small',
                    type: 'success',
                    bordered: false,
                    style: { marginLeft: '8px' }
                }, { default: () => t('current') }) : null
            ]);
        }
    },
    {
        title: t('mail_count'),
        key: "mail_count",
        render(row) {
            return h(NBadge, {
                value: row.mail_count,
                'show-zero': true,
                max: 99,
                type: "success"
            })
        }
    },
    {
        title: t('send_count'),
        key: "send_count",
        render(row) {
            return h(NBadge, {
                value: row.send_count,
                'show-zero': true,
                max: 99,
                type: "success"
            })
        }
    }
]

onMounted(async () => {
    await fetchData()
})
</script>

<template>
    <div style="overflow: auto;">
        <n-data-table :columns="columns" :data="data" :bordered="false" embedded />
    </div>
</template>

<style scoped>
.n-data-table {
    min-width: 700px;
}
</style>
