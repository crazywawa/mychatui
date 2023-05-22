"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";
import { ModalConfigValidator, useAccessStore, ModelConfig } from "../store";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();
  const resetConfig = config.reset;
  const accessStore = useAccessStore();
  // 判断是否处于客户端环境
  if (typeof window !== "undefined") {
    let getUrlParam = () => {
      return window.location.href.split("=").length == 2
        ? window.location.href.split("=")[1].split("&")[0]
        : "";
    // return window.location.href.split("=").length == 2 ? "123" : "";
    };

    if (getUrlParam() && getUrlParam() != accessStore.accessCode) {
      let codeType =
        window.location.href.split("=").length == 2
          ? window.location.href.split("=")[1].split("&")[1]
          : "";
      if (codeType == "1" || codeType == "2") {
        alert(
          "已为您配置gpt4模型，需要您前往 “设置-模型 (model)” 中选择<gpt-4模型>",
        );
      }
      accessStore.updateCode(getUrlParam());
      // ModalConfigValidator.model(
      //   'gpt-4',
      // )

      // updateConfig:(updater: (config: ModelConfig) => void) => void
      // var updateConfig:any=(updater: (config: ModelConfig) => void) => void
      // updateConfig(
      //   (config:any) =>
      //     (config.model = ModalConfigValidator.model(
      //       'gpt-4',
      //     )),
      // )
      // resetConfig()
    }
  }
  // if(accessStore.accessCode){
  //   interface RequestCode {
  //     code:string | null;
  //   }
  //   interface RequestBody {
  //     method: "get" | "post" | "put" | "delete";
  //     body?: string;
  //     headers:any
  //   }

  //   let RequestCode: RequestCode = {
  //     code: accessStore.accessCode
  //   };

  //   let RequestBody: RequestBody = {
  //     method: "post",
  //     body:RequestCode && JSON.stringify(RequestCode),
  //     headers: {
  //       "Content-Type": "application/json"
  //     }
  //   };
  //   let baseUrl ='https://pay2.pkucode.com/prod-api'
  //   fetch(baseUrl+"/wechat/purchased/check/info", RequestBody)
  //     .then((res) => res.json())
  //     .then((res:any) => {
  //       let url:string='http://baidu.com'
  //       if(res.code==200){
  //         if(res.data.codeType=='2'&&res.data.surplusNumber==0){
  //           alert('您购买的5次对话额度已用完，如需继续使用，请前往 '+url+' 购买')
  //         }
  //       }else if(res.msg.indexOf('失效')!=-1){
  //         alert(`${res.msg}，如需继续使用，请前往 ${url} 购买`)
  //       }else{
  //         alert(`${res.msg}`)
  //       }
  //     })
  // }
  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--themeColor");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isMobileScreen = useMobileScreen();

  return (
    <div
      className={
        styles.container +
        ` ${
          config.tightBorder && !isMobileScreen
            ? styles["tight-container"]
            : styles.container
        }`
      }
    >
      <SideBar className={isHome ? styles["sidebar-show"] : ""} />

      <div className={styles["window-content"]} id={SlotID.AppBody}>
        <Routes>
          <Route path={Path.Home} element={<Chat />} />
          <Route path={Path.NewChat} element={<NewChat />} />
          <Route path={Path.Masks} element={<MaskPage />} />
          <Route path={Path.Chat} element={<Chat />} />
          <Route path={Path.Settings} element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export function Home() {
  useSwitchTheme();

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
