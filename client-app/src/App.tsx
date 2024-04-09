import { ErrorBlock, Space } from "antd-mobile";
import useJSBridgeSocket from "./composables/useJSBridgeSocket";
import EventRecord from "./components/EventRecord";
import { useState } from "react";
function App() {
  const [recordList, setRecordList] = useState<{ title: string; seqId: string; content: string; type: string }[]>([]);

  const { socketStatus, socketStatusText, socketStatusTip, sendData } = useJSBridgeSocket({
    receiveData: ({ seqId, data }: ServerMessage) => {
      const { type, ...nativeData } = data;
      setRecordList((recordList) => {
        return [
          {
            seqId,
            type: "toNative",
            title: nativeData.action,
            content: JSON.stringify(nativeData),
          },
          ...recordList,
        ];
      });
      invokeNative({ seqId, data });
    },
  });

  const invokeNative = ({ seqId, data }: ServerMessage) => {
    // TODO: 调用 native 方法
    const result = window.$jsBridge.invoke(data);
    sendData({ seqId, data: result });
    setRecordList((recordList) => {
      return [{ seqId, title: data.action, type: "toServer", content: JSON.stringify(result) }, ...recordList];
    });
  };

  return (
    <>
      <Space direction="vertical" block>
        {recordList.map((item, index) => {
          return <EventRecord key={index} type={item.type} seqId={item.seqId} title={item.title} content={item.content} />;
        })}
      </Space>
      {socketStatus !== 1 && <ErrorBlock fullPage status="disconnected" title={<span>{socketStatusText}</span>} description={<span>{socketStatusTip}</span>}></ErrorBlock>}
    </>
  );
}

export default App;
