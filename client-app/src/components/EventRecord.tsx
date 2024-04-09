import { NoticeBar, Space, Tag } from "antd-mobile";
function EventRecord(props: { time?: string; type: string; seqId: string; title: string; content: string }) {
  return (
    <>
      <NoticeBar
        wrap
        color={props.type == "toNative" ? "info" : "alert"}
        icon=""
        content={
          <Space direction="vertical">
            <Space>
              {/* style={{ "--background-color": "#5790df" }} */}
              <Tag color="primary" fill="outline">
                {props.title}
              </Tag>
              <Tag color="#666" fill="outline">
                {props.seqId}
              </Tag>
            </Space>
            <div style={{ wordBreak: "break-all" }}>{props.content}</div>
          </Space>
        }
      />
    </>
  );
}

export default EventRecord;
