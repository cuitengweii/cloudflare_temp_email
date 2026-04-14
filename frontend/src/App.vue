<script setup>
import { darkTheme, NGlobalStyle, zhCN } from 'naive-ui'
import { computed, onMounted } from 'vue'
import { useScript } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useGlobalState } from './store'
import { useIsMobile } from './utils/composables'
import Header from './views/Header.vue';
import Footer from './views/Footer.vue';
import { api } from './api'

const {
  isDark, loading, useSideMargin, telegramApp, isTelegram
} = useGlobalState()
const adClient = import.meta.env.VITE_GOOGLE_AD_CLIENT;
const adSlot = import.meta.env.VITE_GOOGLE_AD_SLOT;
const { locale } = useI18n({});

const theme = computed(() => isDark.value ? darkTheme : null)
const localeConfig = computed(() => locale.value == 'zh' ? zhCN : null)

const themeOverrides = {
  common: {
    primaryColor: '#00B853',
    primaryColorHover: '#00C65C',
    primaryColorPressed: '#009944',
    primaryColorSuppl: '#00B853',
    successColor: '#28A745',
    warningColor: '#FF9900',
    errorColor: '#FF3366',
    infoColor: '#00A3FF',
    bodyColor: '#F5F7FA',
    cardColor: '#FFFFFF',
    modalColor: '#FFFFFF',
    popoverColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    dividerColor: '#E0E0E0',
    textColorBase: '#1A1A1A',
    textColor1: '#1A1A1A',
    textColor2: '#666666',
    textColor3: '#999999',
    placeholderColor: '#999999',
    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    borderRadius: '4px',
    borderRadiusSmall: '2px',
  },
  Button: {
    borderRadiusSmall: '2px',
    borderRadiusMedium: '4px',
    borderRadiusLarge: '4px',
    textColorPrimary: '#1A1A1A',
    textColorHoverPrimary: '#1A1A1A',
    textColorPressedPrimary: '#1A1A1A',
  },
  Card: {
    borderRadius: '8px',
    color: '#FFFFFF',
    colorEmbedded: '#F5F7FA',
    borderColor: '#E0E0E0',
  },
  Input: {
    borderRadius: '4px',
    color: '#FFFFFF',
    colorFocus: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderColorHover: '#00B853',
    borderColorFocus: '#00B853',
    boxShadowFocus: '0 0 0 2px rgba(0, 184, 83, 0.2)',
    textColor: '#1A1A1A',
    placeholderColor: '#999999',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '4px',
        borderColor: '#E0E0E0',
        borderColorHover: '#00B853',
        borderColorFocus: '#00B853',
        color: '#FFFFFF',
        colorActive: '#FFFFFF',
        textColor: '#1A1A1A',
      }
    }
  },
  DataTable: {
    borderRadius: '8px',
    color: '#FFFFFF',
    borderColor: '#E0E0E0',
    thColor: '#F5F7FA',
    tdColor: 'transparent',
    tdColorHover: 'rgba(0, 184, 83, 0.08)',
    tdColorStriped: 'rgba(0, 184, 83, 0.04)',
    thTextColor: '#666666',
    tdTextColor: '#1A1A1A',
  },
  Tabs: {
    tabTextColorLine: '#666666',
    tabTextColorActiveLine: '#00B853',
    tabTextColorHoverLine: '#1A1A1A',
    colorSegment: '#FFFFFF',
    tabBorderColor: '#E0E0E0',
    barColor: '#00B853',
    tabColor: '#FFFFFF',
  },
  Tag: {
    borderRadius: '2px',
  },
  Message: {
    borderRadius: '8px',
    color: '#FFFFFF',
    textColor: '#1A1A1A',
  },
  Notification: {
    borderRadius: '8px',
    color: '#FFFFFF',
    textColor: '#1A1A1A',
  },
  Modal: {
    borderRadius: '8px',
    color: '#FFFFFF',
    textColor: '#1A1A1A',
  },
  Drawer: {
    borderRadius: '8px',
    color: '#FFFFFF',
    textColor: '#1A1A1A',
  },
  Menu: {
    itemTextColor: '#1A1A1A',
    itemTextColorHover: '#00B853',
    itemTextColorActive: '#00B853',
    itemColorHover: 'rgba(0, 184, 83, 0.1)',
    itemColorActive: 'rgba(0, 184, 83, 0.15)',
    itemColorActiveHover: 'rgba(0, 184, 83, 0.2)',
    itemIconColor: '#666666',
    itemIconColorHover: '#00B853',
    itemIconColorActive: '#00B853',
  },
  Dropdown: {
    color: '#FFFFFF',
    optionColor: '#FFFFFF',
    optionTextColor: '#1A1A1A',
    optionColorHover: 'rgba(0, 184, 83, 0.1)',
    optionTextColorHover: '#00B853',
    optionColorActive: 'rgba(0, 184, 83, 0.15)',
    optionTextColorActive: '#00B853',
  },
  Pagination: {
    itemColor: '#FFFFFF',
    itemBorderColor: '#E0E0E0',
    itemTextColor: '#1A1A1A',
    itemColorHover: 'rgba(0, 184, 83, 0.1)',
    itemTextColorHover: '#00B853',
    itemColorActive: 'rgba(0, 184, 83, 0.15)',
    itemTextColorActive: '#00B853',
    itemBorderColorActive: '#00B853',
  },
  Switch: {
    railColor: '#E0E0E0',
    railColorActive: 'rgba(0, 184, 83, 0.5)',
    buttonColor: '#FFFFFF',
    buttonColorActive: '#00B853',
  },
  Tooltip: {
    color: '#FFFFFF',
    textColor: '#1A1A1A',
    borderRadius: '4px',
  },
  Popover: {
    color: '#FFFFFF',
    textColor: '#1A1A1A',
    borderRadius: '8px',
  },
  Dialog: {
    color: '#FFFFFF',
    textColor: '#1A1A1A',
    borderRadius: '8px',
  },
  Collapse: {
    titleTextColor: '#1A1A1A',
    arrowColor: '#666666',
    borderColor: '#E0E0E0',
    color: 'transparent',
    colorMuted: '#F0F0F0',
  },
  List: {
    color: 'transparent',
    itemColor: 'transparent',
    itemColorHover: 'rgba(0, 184, 83, 0.06)',
  },
}
const isMobile = useIsMobile()
const showSideMargin = computed(() => !isMobile.value && useSideMargin.value);
const showAd = computed(() => !isMobile.value && adClient && adSlot);
const gridMaxCols = computed(() => showAd.value ? 8 : 12);

// Load Google Ad script at top level (not inside onMounted)
if (showAd.value) {
  useScript({
    src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`,
    async: true,
    crossorigin: "anonymous",
  })
}

onMounted(async () => {
  try {
    await api.getUserSettings();
  } catch (error) {
    console.error(error);
  }

  const token = import.meta.env.VITE_CF_WEB_ANALY_TOKEN;

  const exist = document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]') !== null
  if (token && !exist) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.dataset.cfBeacon = `{ token: ${token} }`;
    document.body.appendChild(script);
  }

  // check if google ad is enabled
  if (showAd.value) {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }


  // check if telegram is enabled
  const enableTelegram = import.meta.env.VITE_IS_TELEGRAM;
  if (
    (typeof enableTelegram === 'boolean' && enableTelegram === true)
    ||
    (typeof enableTelegram === 'string' && enableTelegram === 'true')
  ) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    telegramApp.value = window.Telegram?.WebApp || {};
    isTelegram.value = !!window.Telegram?.WebApp?.initData;
  }
});
</script>

<template>
  <n-config-provider :locale="localeConfig" :theme="theme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-spin description="loading..." :show="loading">
      <n-notification-provider container-style="margin-top: 60px;">
        <n-message-provider container-style="margin-top: 20px;">
          <n-grid x-gap="12" :cols="gridMaxCols">
            <n-gi v-if="showSideMargin" span="1">
              <div class="side" v-if="showAd">
                <ins class="adsbygoogle" style="display:block" :data-ad-client="adClient" :data-ad-slot="adSlot"
                  data-ad-format="auto" data-full-width-responsive="true"></ins>
              </div>
            </n-gi>
            <n-gi :span="!showSideMargin ? gridMaxCols : (gridMaxCols - 2)">
              <div class="main">
                <n-space vertical>
                  <n-layout style="min-height: 80vh;">
                    <Header />
                    <router-view></router-view>
                  </n-layout>
                  <Footer />
                </n-space>
              </div>
            </n-gi>
            <n-gi v-if="showSideMargin" span="1">
              <div class="side" v-if="showAd">
                <ins class="adsbygoogle" style="display:block" :data-ad-client="adClient" :data-ad-slot="adSlot"
                  data-ad-format="auto" data-full-width-responsive="true"></ins>
              </div>
            </n-gi>
          </n-grid>
          <n-back-top />
        </n-message-provider>
      </n-notification-provider>
    </n-spin>
  </n-config-provider>
</template>


<style>
@import './assets/cyber-industrial-theme.css';

.n-switch {
  margin-left: 10px;
  margin-right: 10px;
}
</style>

<style scoped>
.side {
  min-height: 100vh;
  background-color: var(--bg-main);
}

.main {
  min-height: 100vh;
  height: auto;
  text-align: center;
  background-color: var(--bg-main);
}

.n-grid {
  min-height: 100vh;
}

.n-gi {
  min-height: 100vh;
}

.n-space {
  min-height: 100vh;
}
</style>
