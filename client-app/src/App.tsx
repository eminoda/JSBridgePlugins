import { ErrorBlock, Space, Result } from "antd-mobile";
import { FaceRecognitionOutline } from "antd-mobile-icons";
import useJSBridgeSocket from "./composables/useJSBridgeSocket";
import EventRecord from "./components/EventRecord";
import { useState } from "react";
function App() {
  const [recordList, setRecordList] = useState<{ title: string; seqId: string; content: string; type: string }[]>([]);

  const buildTimeStamp = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    let hours = String(date.getHours()).padStart(2, "0");
    let minutes = String(date.getMinutes()).padStart(2, "0");
    let seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  const { socketStatus, socketStatusText, socketStatusTip, sendData } = useJSBridgeSocket({
    receiveData: ({ seqId, data }: ServerMessage) => {
      const { type, ...nativeData } = data;
      const time = buildTimeStamp();
      setRecordList((recordList) => {
        return [{ time, seqId, type: "toNative", title: nativeData.action, content: JSON.stringify(nativeData) }, ...recordList];
      });
      invokeNative({ seqId, data });
    },
  });

  const invokeNative = async ({ seqId, data }: ServerMessage) => {
    // TODO: 调用 native 方法
    const result = await window.$jsBridge.invoke(data);
    const time = buildTimeStamp();
    sendData({ seqId, data: result });
    setRecordList((recordList) => {
      return [{ time, seqId, title: data.action, type: "toServer", content: JSON.stringify(result) }, ...recordList];
    });
  };

  return (
    <>
      <Space direction="vertical" block>
        {recordList.map((item, index) => {
          return <EventRecord key={index} type={item.type} seqId={item.seqId} title={item.title} content={item.content} />;
        })}
      </Space>
      {socketStatus === 1 && recordList.length === 0 && <Result icon={<FaceRecognitionOutline />} status="success" title="服务已连接" description="等待业务端操作" />}
      {socketStatus !== 1 && <ErrorBlock status="disconnected" title={<span>{socketStatusText}</span>} description={<span>{socketStatusTip}</span>}></ErrorBlock>}
    </>
  );
}

export default App;
