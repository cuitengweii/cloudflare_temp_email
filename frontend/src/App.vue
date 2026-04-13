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

const lightAccent = '#00B853'
const darkAccent = '#5DD62C'
const accent = computed(() => isDark.value ? darkAccent : lightAccent)

const themeOverrides = computed(() => ({
  common: {
    primaryColor: accent.value,
    primaryColorHover: isDark.value ? '#7AE055' : '#00C65C',
    primaryColorPressed: isDark.value ? '#4BB020' : '#009944',
    primaryColorSuppl: accent.value,
    successColor: '#28A745',
    warningColor: '#FF9900',
    errorColor: '#FF3366',
    infoColor: '#00A3FF',
    bodyColor: isDark.value ? '#0F0F0F' : '#F5F7FA',
    cardColor: isDark.value ? '#202020' : '#FFFFFF',
    modalColor: isDark.value ? '#202020' : '#FFFFFF',
    popoverColor: isDark.value ? '#202020' : '#FFFFFF',
    borderColor: isDark.value ? '#333333' : '#E0E0E0',
    dividerColor: isDark.value ? '#333333' : '#E0E0E0',
    textColorBase: isDark.value ? '#E0E0E0' : '#1A1A1A',
    textColor1: isDark.value ? '#E0E0E0' : '#1A1A1A',
    textColor2: isDark.value ? '#888888' : '#666666',
    textColor3: isDark.value ? '#666666' : '#999999',
    placeholderColor: isDark.value ? '#666666' : '#999999',
    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    borderRadius: '4px',
    borderRadiusSmall: '2px',
  },
  Button: {
    borderRadiusSmall: '2px',
    borderRadiusMedium: '4px',
    borderRadiusLarge: '4px',
    colorPrimary: accent.value,
    colorPrimaryHover: isDark.value ? 'rgba(93, 214, 44, 0.15)' : 'rgba(0, 184, 83, 0.15)',
    colorPrimaryPressed: isDark.value ? 'rgba(93, 214, 44, 0.25)' : 'rgba(0, 184, 83, 0.25)',
    textColorPrimary: isDark.value ? '#0F0F0F' : '#FFFFFF',
    textColorHoverPrimary: isDark.value ? '#0F0F0F' : '#FFFFFF',
    textColorPressedPrimary: isDark.value ? '#0F0F0F' : '#FFFFFF',
  },
  Card: {
    borderRadius: '8px',
    color: isDark.value ? '#202020' : '#FFFFFF',
    colorEmbedded: isDark.value ? '#1A1A1A' : '#F5F7FA',
    borderColor: isDark.value ? '#333333' : '#E0E0E0',
  },
  Input: {
    borderRadius: '4px',
    color: isDark.value ? '#0F0F0F' : '#FFFFFF',
    colorFocus: isDark.value ? '#0F0F0F' : '#FFFFFF',
    borderColor: isDark.value ? '#333333' : '#E0E0E0',
    borderColorHover: accent.value,
    borderColorFocus: accent.value,
    boxShadowFocus: isDark.value ? '0 0 0 2px rgba(93, 214, 44, 0.2)' : '0 0 0 2px rgba(0, 184, 83, 0.2)',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    placeholderColor: isDark.value ? '#666666' : '#999999',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '4px',
        borderColor: isDark.value ? '#333333' : '#E0E0E0',
        borderColorHover: accent.value,
        borderColorFocus: accent.value,
        color: isDark.value ? '#0F0F0F' : '#FFFFFF',
        colorActive: isDark.value ? '#0F0F0F' : '#FFFFFF',
        textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
      }
    }
  },
  DataTable: {
    borderRadius: '8px',
    color: isDark.value ? '#202020' : '#FFFFFF',
    borderColor: isDark.value ? '#333333' : '#E0E0E0',
    thColor: isDark.value ? '#202020' : '#F5F7FA',
    tdColor: 'transparent',
    tdColorHover: isDark.value ? 'rgba(93, 214, 44, 0.1)' : 'rgba(0, 184, 83, 0.08)',
    tdColorStriped: isDark.value ? 'rgba(93, 214, 44, 0.05)' : 'rgba(0, 184, 83, 0.04)',
    thTextColor: isDark.value ? '#888888' : '#666666',
    tdTextColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
  },
  Tabs: {
    tabTextColorLine: isDark.value ? '#888888' : '#666666',
    tabTextColorActiveLine: accent.value,
    tabTextColorHoverLine: isDark.value ? '#E0E0E0' : '#1A1A1A',
    colorSegment: isDark.value ? '#202020' : '#FFFFFF',
    tabBorderColor: isDark.value ? '#333333' : '#E0E0E0',
    barColor: accent.value,
    tabColor: isDark.value ? '#202020' : '#FFFFFF',
  },
  Tag: {
    borderRadius: '2px',
  },
  Message: {
    borderRadius: '8px',
    color: isDark.value ? '#202020' : '#FFFFFF',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
  },
  Notification: {
    borderRadius: '8px',
    color: isDark.value ? '#202020' : '#FFFFFF',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
  },
  Modal: {
    borderRadius: '8px',
    color: isDark.value ? '#202020' : '#FFFFFF',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
  },
  Drawer: {
    borderRadius: '8px',
    color: isDark.value ? '#202020' : '#FFFFFF',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
  },
  Menu: {
    itemTextColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    itemTextColorHover: accent.value,
    itemTextColorActive: accent.value,
    itemColorHover: isDark.value ? 'rgba(93, 214, 44, 0.1)' : 'rgba(0, 184, 83, 0.1)',
    itemColorActive: isDark.value ? 'rgba(93, 214, 44, 0.15)' : 'rgba(0, 184, 83, 0.15)',
    itemColorActiveHover: isDark.value ? 'rgba(93, 214, 44, 0.2)' : 'rgba(0, 184, 83, 0.2)',
    itemIconColor: isDark.value ? '#888888' : '#666666',
    itemIconColorHover: accent.value,
    itemIconColorActive: accent.value,
  },
  Dropdown: {
    color: isDark.value ? '#202020' : '#FFFFFF',
    optionColor: isDark.value ? '#202020' : '#FFFFFF',
    optionTextColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    optionColorHover: isDark.value ? 'rgba(93, 214, 44, 0.1)' : 'rgba(0, 184, 83, 0.1)',
    optionTextColorHover: accent.value,
    optionColorActive: isDark.value ? 'rgba(93, 214, 44, 0.15)' : 'rgba(0, 184, 83, 0.15)',
    optionTextColorActive: accent.value,
  },
  Pagination: {
    itemColor: isDark.value ? '#202020' : '#FFFFFF',
    itemBorderColor: isDark.value ? '#333333' : '#E0E0E0',
    itemTextColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    itemColorHover: isDark.value ? 'rgba(93, 214, 44, 0.1)' : 'rgba(0, 184, 83, 0.1)',
    itemTextColorHover: accent.value,
    itemColorActive: isDark.value ? 'rgba(93, 214, 44, 0.15)' : 'rgba(0, 184, 83, 0.15)',
    itemTextColorActive: accent.value,
    itemBorderColorActive: accent.value,
  },
  Switch: {
    railColor: isDark.value ? '#333333' : '#E0E0E0',
    railColorActive: isDark.value ? 'rgba(93, 214, 44, 0.5)' : 'rgba(0, 184, 83, 0.5)',
    buttonColor: isDark.value ? '#888888' : '#FFFFFF',
    buttonColorActive: accent.value,
  },
  Tooltip: {
    color: isDark.value ? '#202020' : '#FFFFFF',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    borderRadius: '4px',
  },
  Popover: {
    color: isDark.value ? '#202020' : '#FFFFFF',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    borderRadius: '8px',
  },
  Dialog: {
    color: isDark.value ? '#202020' : '#FFFFFF',
    textColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    borderRadius: '8px',
  },
  Collapse: {
    titleTextColor: isDark.value ? '#E0E0E0' : '#1A1A1A',
    arrowColor: isDark.value ? '#888888' : '#666666',
    borderColor: isDark.value ? '#333333' : '#E0E0E0',
    color: 'transparent',
    colorMuted: isDark.value ? '#1A1A1A' : '#F0F0F0',
  },
  List: {
    color: 'transparent',
    itemColor: 'transparent',
    itemColorHover: isDark.value ? 'rgba(93, 214, 44, 0.08)' : 'rgba(0, 184, 83, 0.06)',
  },
}))
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

/* test marker */
</style>

<style scoped>
.side {
  height: 100vh;
}

.main {
  height: 100vh;
  text-align: center;
}

.n-grid {
  height: 100%;
}

.n-gi {
  height: 100%;
}

.n-space {
  height: 100%;
}
</style>
