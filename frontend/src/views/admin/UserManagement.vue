<script setup>
import { ref, h, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { NMenu, NButton, NBadge, NTag } from 'naive-ui';
import { MenuFilled } from '@vicons/material';

import { useGlobalState } from '../../store';
import { api } from '../../api';
import { hashPassword } from '../../utils';

import UserAddressManagement from './UserAddressManagement.vue';

const { loading, openSettings } = useGlobalState();
const message = useMessage();

const { t } = useI18n({
    messages: {
        en: {
            success: 'Success',
            copied: 'Copied',
            user_email: 'User Email',
            role: 'Role',
            address_count: 'Address Count',
            created_at: 'Created At',
            actions: 'Actions',
            query: 'Query',
            itemCount: 'Item Count',
            deleteUser: 'Delete User',
            delete: 'Delete',
            deleteUserTip: 'Are you sure you want to delete this user?',
            resetPassword: 'Admin Reset Password',
            resetPasswordTip: 'Generate a new temporary password and send it to the employee.',
            pleaseInput: 'Please input complete information',
            createUser: 'Create User',
            email: 'Email',
            password: 'Password',
            generatedPassword: 'Generated Password',
            regeneratePassword: 'Regenerate',
            copyPassword: 'Copy',
            employeeCredentials: 'Employee Credentials',
            employeeCredentialsTip: 'Send this email and password to the employee for first login.',
            copyCredentials: 'Copy Credentials',
            resetCredentials: 'Reset Credentials',
            resetCredentialsTip: 'Password reset complete. Send this new temporary password to the employee.',
            changeRole: 'Change Role',
            prefix: 'Prefix',
            domains: 'Domains',
            roleDonotExist: 'Current Role does not exist',
            userAddressManagement: 'Address Management',
        },
        zh: {
            success: '\u6210\u529f',
            copied: '\u5df2\u590d\u5236',
            user_email: '\u7528\u6237\u90ae\u7bb1',
            role: '\u89d2\u8272',
            address_count: '\u5730\u5740\u6570\u91cf',
            created_at: '\u521b\u5efa\u65f6\u95f4',
            actions: '\u64cd\u4f5c',
            query: '\u67e5\u8be2',
            itemCount: '\u603b\u6570',
            deleteUser: '\u5220\u9664\u7528\u6237',
            delete: '\u5220\u9664',
            deleteUserTip: '\u786e\u5b9a\u8981\u5220\u9664\u6b64\u7528\u6237\u5417\uff1f',
            resetPassword: '\u7ba1\u7406\u5458\u91cd\u7f6e\u5bc6\u7801',
            resetPasswordTip: '\u751f\u6210\u65b0\u7684\u4e34\u65f6\u5bc6\u7801\u5e76\u4e0b\u53d1\u7ed9\u5458\u5de5\u3002',
            pleaseInput: '\u8bf7\u8f93\u5165\u5b8c\u6574\u4fe1\u606f',
            createUser: '\u521b\u5efa\u7528\u6237',
            email: '\u90ae\u7bb1',
            password: '\u5bc6\u7801',
            generatedPassword: '\u968f\u673a\u5bc6\u7801',
            regeneratePassword: '\u91cd\u65b0\u751f\u6210',
            copyPassword: '\u590d\u5236',
            employeeCredentials: '\u5458\u5de5\u767b\u5f55\u4fe1\u606f',
            employeeCredentialsTip: '\u8bf7\u5c06\u8fd9\u4e2a\u90ae\u7bb1\u548c\u968f\u673a\u5bc6\u7801\u53d1\u7ed9\u5458\u5de5\uff0c\u4f5c\u4e3a\u9996\u6b21\u767b\u5f55\u51ed\u8bc1\u3002',
            copyCredentials: '\u590d\u5236\u767b\u5f55\u4fe1\u606f',
            resetCredentials: '\u91cd\u7f6e\u540e\u7684\u767b\u5f55\u4fe1\u606f',
            resetCredentialsTip: '\u5bc6\u7801\u5df2\u91cd\u7f6e\uff0c\u8bf7\u5c06\u65b0\u4e34\u65f6\u5bc6\u7801\u4e0b\u53d1\u7ed9\u5458\u5de5\u3002',
            changeRole: '\u66f4\u6539\u89d2\u8272',
            prefix: '\u524d\u7f00',
            domains: '\u57df\u540d',
            roleDonotExist: '\u5f53\u524d\u89d2\u8272\u4e0d\u5b58\u5728',
            userAddressManagement: '\u5730\u5740\u7ba1\u7406',
        }
    }
});

const data = ref([]);
const count = ref(0);
const page = ref(1);
const pageSize = ref(20);

const userQuery = ref('');
const showResetPassword = ref(false);
const newResetPassword = ref('');
const resetCredential = ref({
    email: '',
    password: ''
});
const showResetCredential = ref(false);
const showDeleteUser = ref(false);
const curUserId = ref(0);
const curUserEmail = ref('');
const showCreateUser = ref(false);
const showCreatedCredential = ref(false);
const user = ref({
    email: '',
    password: ''
});
const createdCredential = ref({
    email: '',
    password: ''
});
const showChangeRole = ref(false);
const showUserAddressManagement = ref(false);
const userRoles = ref([]);
const curUserRole = ref('');

const userRolesOptions = computed(() => {
    return userRoles.value.map((role) => ({
        label: role.role,
        value: role.role
    }));
});

const generateRandomPassword = (length = 16) => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join('');
};

const prepareCreateUser = () => {
    user.value.email = '';
    user.value.password = generateRandomPassword();
    showCreateUser.value = true;
};

const regenerateCreatePassword = () => {
    user.value.password = generateRandomPassword();
};

const copyText = async (text) => {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        message.success(t('copied'));
    } catch (error) {
        console.log(error);
        message.error(error.message || 'copy failed');
    }
};

const copyCredentials = async () => {
    await copyText(`Email: ${createdCredential.value.email}\nPassword: ${createdCredential.value.password}`);
};

const fetchUserRoles = async () => {
    try {
        const results = await api.fetch('/admin/user_roles');
        userRoles.value = results;
    } catch (error) {
        console.log(error);
        message.error(error.message || 'error');
    }
};

const fetchData = async () => {
    try {
        userQuery.value = userQuery.value.trim();
        const { results, count: userCount } = await api.fetch(
            '/admin/users'
            + `?limit=${pageSize.value}`
            + `&offset=${(page.value - 1) * pageSize.value}`
            + (userQuery.value ? `&query=${userQuery.value}` : '')
        );
        data.value = results;
        if (userCount > 0) {
            count.value = userCount;
        }
    } catch (error) {
        console.log(error);
        message.error(error.message || 'error');
    }
};

const resetPassword = async () => {
    const nextPassword = newResetPassword.value || generateRandomPassword();
    try {
        await api.fetch(`/admin/users/${curUserId.value}/reset_password`, {
            method: 'POST',
            body: JSON.stringify({
                password: await hashPassword(nextPassword)
            })
        });
        resetCredential.value = {
            email: curUserEmail.value,
            password: nextPassword
        };
        message.success(t('success'));
        showResetPassword.value = false;
        showResetCredential.value = true;
    } catch (error) {
        console.log(error);
        message.error(error.message || 'error');
    }
};

const createUser = async () => {
    if (!user.value.email || !user.value.password) {
        message.error(t('pleaseInput'));
        return;
    }
    try {
        const createdEmail = user.value.email;
        const createdPassword = user.value.password;
        await api.fetch('/admin/users', {
            method: 'POST',
            body: JSON.stringify({
                email: createdEmail,
                password: await hashPassword(createdPassword)
            })
        });
        createdCredential.value = {
            email: createdEmail,
            password: createdPassword
        };
        message.success(t('success'));
        await fetchData();
        showCreateUser.value = false;
        showCreatedCredential.value = true;
        user.value.email = '';
        user.value.password = generateRandomPassword();
    } catch (error) {
        console.log(error);
        message.error(error.message || 'error');
    }
};

const regenerateResetPassword = () => {
    newResetPassword.value = generateRandomPassword();
};

const deleteUser = async () => {
    try {
        await api.fetch(`/admin/users/${curUserId.value}`, {
            method: 'DELETE'
        });
        message.success(t('success'));
        showDeleteUser.value = false;
    } catch (error) {
        console.log(error);
        message.error(error.message || 'error');
    }
};

const changeRole = async () => {
    try {
        await api.fetch('/admin/user_roles', {
            method: 'POST',
            body: JSON.stringify({
                user_id: curUserId.value,
                role_text: curUserRole.value
            })
        });
        message.success(t('success'));
        showChangeRole.value = false;
        await fetchData();
    } catch (error) {
        console.log(error);
        message.error(error.message || 'error');
    }
};

const columns = [
    {
        title: 'ID',
        key: 'id'
    },
    {
        title: t('user_email'),
        key: 'user_email'
    },
    {
        title: t('role'),
        key: 'role_text',
        render(row) {
            if (!row.role_text) return null;
            return h(NTag, {
                bordered: false,
                type: 'info'
            }, {
                default: () => row.role_text
            });
        }
    },
    {
        title: t('address_count'),
        key: 'address_count',
        render(row) {
            return h(NButton, {
                text: true,
                onClick: () => {
                    if (row.address_count <= 0) return;
                    curUserId.value = row.id;
                    showUserAddressManagement.value = true;
                }
            }, {
                icon: () => h(NBadge, {
                    value: row.address_count,
                    'show-zero': true,
                    max: 99,
                    type: 'success'
                }),
                default: () => row.address_count > 0 ? t('userAddressManagement') : ''
            });
        }
    },
    {
        title: t('created_at'),
        key: 'created_at'
    },
    {
        title: t('actions'),
        key: 'actions',
        render(row) {
            return h('div', [
                h(NMenu, {
                    mode: 'horizontal',
                    options: [
                        {
                            label: t('actions'),
                            icon: () => h(MenuFilled),
                            key: 'action',
                            children: [
                                {
                                    label: () => h(NButton, {
                                        text: true,
                                        onClick: () => {
                                            curUserId.value = row.id;
                                            showUserAddressManagement.value = true;
                                        }
                                    }, { default: () => t('userAddressManagement') }),
                                    show: row.address_count > 0
                                },
                                {
                                    label: () => h(NButton, {
                                        text: true,
                                        onClick: () => {
                                            curUserId.value = row.id;
                                            curUserRole.value = row.role_text;
                                            showChangeRole.value = true;
                                        }
                                    }, { default: () => t('changeRole') })
                                },
                                {
                                    label: () => h(NButton, {
                                        text: true,
                                            onClick: () => {
                                                curUserId.value = row.id;
                                                curUserEmail.value = row.user_email;
                                                newResetPassword.value = generateRandomPassword();
                                                showResetPassword.value = true;
                                            }
                                    }, { default: () => t('resetPassword') })
                                },
                                {
                                    label: () => h(NButton, {
                                        text: true,
                                        onClick: () => {
                                            curUserId.value = row.id;
                                            showDeleteUser.value = true;
                                        }
                                    }, { default: () => t('delete') })
                                }
                            ]
                        }
                    ]
                })
            ]);
        }
    }
];

const getRolePrefix = (role) => {
    const res = userRoles.value.find((item) => item.role === role)?.prefix;
    if (res === undefined || res === null) return openSettings.value.prefix;
    return res;
};

const getRoleDomains = (role) => {
    const res = userRoles.value.find((item) => item.role === role)?.domains;
    if (res === undefined || res === null || res.length === 0) return openSettings.value.defaultDomains;
    return res;
};

const roleDonotExist = computed(() => {
    return curUserRole.value && !userRoles.value.some((item) => item.role === curUserRole.value);
});

watch([page, pageSize], async () => {
    await fetchData();
});

onMounted(async () => {
    await fetchUserRoles();
    await fetchData();
});
</script>

<template>
    <div style="margin-top: 10px;">
        <n-modal v-model:show="showCreateUser" preset="dialog" :title="t('createUser')">
            <n-form>
                <n-form-item-row :label="t('email')" required>
                    <n-input v-model:value="user.email" />
                </n-form-item-row>
                <n-form-item-row :label="t('generatedPassword')" required>
                    <n-input-group>
                        <n-input v-model:value="user.password" readonly />
                        <n-button @click="regenerateCreatePassword" tertiary type="primary">
                            {{ t('regeneratePassword') }}
                        </n-button>
                        <n-button @click="copyText(user.password)" tertiary type="primary">
                            {{ t('copyPassword') }}
                        </n-button>
                    </n-input-group>
                </n-form-item-row>
                <n-alert type="info" :show-icon="false" :bordered="false">
                    {{ t('employeeCredentialsTip') }}
                </n-alert>
            </n-form>
            <template #action>
                <n-button :loading="loading" @click="createUser" size="small" tertiary type="primary">
                    {{ t('createUser') }}
                </n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showCreatedCredential" preset="dialog" :title="t('employeeCredentials')">
            <n-space vertical>
                <n-alert type="success" :show-icon="false" :bordered="false">
                    {{ t('employeeCredentialsTip') }}
                </n-alert>
                <n-form-item-row :label="t('email')">
                    <n-input :value="createdCredential.email" readonly />
                </n-form-item-row>
                <n-form-item-row :label="t('generatedPassword')">
                    <n-input :value="createdCredential.password" readonly />
                </n-form-item-row>
            </n-space>
            <template #action>
                <n-button size="small" tertiary type="primary" @click="copyCredentials">
                    {{ t('copyCredentials') }}
                </n-button>
                <n-button size="small" tertiary @click="showCreatedCredential = false">
                    OK
                </n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showResetPassword" preset="dialog" :title="t('resetPassword')">
            <n-form>
                <n-form-item-row :label="t('email')">
                    <n-input :value="curUserEmail" readonly />
                </n-form-item-row>
                <n-form-item-row :label="t('generatedPassword')" required>
                    <n-input-group>
                        <n-input v-model:value="newResetPassword" readonly />
                        <n-button @click="regenerateResetPassword" tertiary type="primary">
                            {{ t('regeneratePassword') }}
                        </n-button>
                        <n-button @click="copyText(newResetPassword)" tertiary type="primary">
                            {{ t('copyPassword') }}
                        </n-button>
                    </n-input-group>
                </n-form-item-row>
                <n-alert type="warning" :show-icon="false" :bordered="false">
                    {{ t('resetPasswordTip') }}
                </n-alert>
            </n-form>
            <template #action>
                <n-button :loading="loading" @click="resetPassword" size="small" tertiary type="primary">
                    {{ t('resetPassword') }}
                </n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showResetCredential" preset="dialog" :title="t('resetCredentials')">
            <n-space vertical>
                <n-alert type="success" :show-icon="false" :bordered="false">
                    {{ t('resetCredentialsTip') }}
                </n-alert>
                <n-form-item-row :label="t('email')">
                    <n-input :value="resetCredential.email" readonly />
                </n-form-item-row>
                <n-form-item-row :label="t('generatedPassword')">
                    <n-input :value="resetCredential.password" readonly />
                </n-form-item-row>
            </n-space>
            <template #action>
                <n-button size="small" tertiary type="primary" @click="copyText(`Email: ${resetCredential.email}\nPassword: ${resetCredential.password}`)">
                    {{ t('copyCredentials') }}
                </n-button>
                <n-button size="small" tertiary @click="showResetCredential = false">
                    OK
                </n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showDeleteUser" preset="dialog" :title="t('deleteUser')">
            <p>{{ t('deleteUserTip') }}</p>
            <template #action>
                <n-button :loading="loading" @click="deleteUser" size="small" tertiary type="error">
                    {{ t('deleteUser') }}
                </n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showChangeRole" preset="dialog" :title="t('changeRole')">
            <n-alert v-if="roleDonotExist" type="error" :bordered="false">
                <span>{{ t('roleDonotExist') }}</span>
            </n-alert>
            <p>{{ t('prefix') + ': ' + getRolePrefix(curUserRole) }}</p>
            <p>{{ t('domains') + ': ' + JSON.stringify(getRoleDomains(curUserRole)) }}</p>
            <n-select v-model:value="curUserRole" clearable :options="userRolesOptions" />
            <template #action>
                <n-button :loading="loading" @click="changeRole" size="small" tertiary type="primary">
                    {{ t('changeRole') }}
                </n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showUserAddressManagement" preset="card" :title="t('userAddressManagement')">
            <UserAddressManagement :user_id="curUserId" />
        </n-modal>
        <n-input-group>
            <n-input v-model:value="userQuery" @keydown.enter="fetchData" />
            <n-button @click="fetchData" type="primary" tertiary>
                {{ t('query') }}
            </n-button>
        </n-input-group>
        <div style="overflow: auto;">
            <div style="display: inline-block;">
                <n-pagination
                    v-model:page="page"
                    v-model:page-size="pageSize"
                    :item-count="count"
                    :page-sizes="[20, 50, 100]"
                    show-size-picker
                >
                    <template #prefix="{ itemCount }">
                        {{ t('itemCount') }}: {{ itemCount }}
                    </template>
                    <template #suffix>
                        <n-button
                            @click="prepareCreateUser"
                            size="small"
                            tertiary
                            type="primary"
                            style="margin-left: 10px"
                        >
                            {{ t('createUser') }}
                        </n-button>
                    </template>
                </n-pagination>
            </div>
            <n-data-table :columns="columns" :data="data" :bordered="false" embedded />
        </div>
    </div>
</template>

<style scoped>
.n-pagination {
    margin-top: 10px;
    margin-bottom: 10px;
}

.n-data-table {
    min-width: 800px;
}
</style>
