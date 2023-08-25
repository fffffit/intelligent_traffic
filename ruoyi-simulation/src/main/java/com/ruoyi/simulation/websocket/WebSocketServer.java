package com.ruoyi.simulation.websocket;

import com.alibaba.fastjson2.JSON;
import com.ruoyi.common.constant.HttpStatus;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.simulation.util.*;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.enums.ReadyState;
import org.java_websocket.handshake.ServerHandshake;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static com.ruoyi.common.core.domain.AjaxResult.*;

@Component
@ServerEndpoint("/simulation/websocket/")
public class WebSocketServer {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketServer.class);
    private static Map<String, WebSocketServer> webSocketMap = new ConcurrentHashMap<String, WebSocketServer>();
    private Session session = null;
    private static FileUtil fileUtil;
    private static CallPython callPython;
    private static CallMatlab callMatlab;
    private static Environment environment;

    @Autowired
    public void setFileUtil(FileUtil fileUtil) {
        WebSocketServer.fileUtil = fileUtil;
    }

    @Autowired
    public void setCallPython(CallPython callPython) {
        WebSocketServer.callPython = callPython;
    }

    @Autowired
    public void setCallMatlab(CallMatlab callMatlab) {
        WebSocketServer.callMatlab = callMatlab;
    }

    @Autowired
    public void setEnvironment(Environment environment) {
        WebSocketServer.environment = environment;
    }

    /**
     * 打开连接的回调函数
     *
     * @param session
     */
    @OnOpen
    public void openConnection(Session session) {
        this.session = session;
        webSocketMap.put(session.getId(), this);
        logger.info("----------------------------连接已建立-----------------------------");
    }

    /**
     * 关闭连接的回调函数
     *
     * @param session
     */
    @OnClose
    public void closeConnection(Session session) {
        webSocketMap.remove(session);
        logger.info("----------------------------连接已关闭-----------------------------");
    }

    /**
     * 收到客户端消息时的回调函数
     *
     * @param blob    语音命令
     * @param session
     */
    @OnMessage
    public void onMessage(byte[] blob, Session session) {
        logger.info("----------------------------收到消息-----------------------------");
        AjaxResult result = fileUtil.storeFileToDisk(blob);
        if (!result.get(CODE_TAG).equals(HttpStatus.SUCCESS)) {
            sendErrorResponse(String.valueOf(result.get(MSG_TAG)), session.getId());
            return;
        }
        String targetPath = String.valueOf(result.get(DATA_TAG));
        //第一步，将语音转换为文字
        result = callPython.generateText(targetPath);
        if (!result.get(CODE_TAG).equals(HttpStatus.SUCCESS)) {
            sendErrorResponse(String.valueOf(result.get(MSG_TAG)), session.getId());
            return;
        }
        String text = String.valueOf(result.get(DATA_TAG));
        logger.info("解析语音为文本如下：" + text);
        sendSuccessResponse(String.valueOf(result.get(MSG_TAG)),"语音识别成功!当前语音转换为如下文本：" + text, session.getId());

        //第二步，发送文字命令，调用“大模型”获取生成交通场景模型所需的代码
        result = callPython.generateCode(text);
        if (!result.get(CODE_TAG).equals(HttpStatus.SUCCESS)) {
            sendErrorResponse(String.valueOf(result.get(MSG_TAG)), session.getId());
            return;
        }
        List<String> codeList = (List<String>) result.get(DATA_TAG);
        String codeStr = ListUtil.toString(codeList);
        logger.info("代码如下：" + codeStr);
        sendSuccessResponse(String.valueOf(result.get(MSG_TAG)),"代码生成成功!根据文本命令生成的代码内容为：" + codeStr, session.getId());
        //第三步，调用“WebGL”渲染三维效果像素流
        result = callMatlab.generatePixelStream(codeList);
        if (!result.get(CODE_TAG).equals(HttpStatus.SUCCESS)) {
            sendErrorResponse(String.valueOf(result.get(MSG_TAG)), session.getId());
            return;
        }
        byte[] byteArray = (byte[]) result.get(DATA_TAG);
        String message = String.valueOf(result.get(MSG_TAG));
        StreamSet stream = getVoiceTips(message);
        stream.setGraph(byteArray);
        result = AjaxResult.success("三维场景像素流生成成功!", stream);
        sendMessage(JSON.toJSONString(result), session.getId());
    }
    /**
     * 发送消息到客户端
     *
     * @param message
     * @param sessionId
     */
    public void sendMessage(String message, String sessionId) {
        try {
            WebSocketServer server = webSocketMap.get(sessionId);
            server.session.getBasicRemote().sendText(message);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 返回执行失败响应
     * @param message 语音消息文本
     * @param sessionId socket会话id
     */
    public void sendErrorResponse(String message, String sessionId) {
        StreamSet stream = getVoiceTips(message);
        AjaxResult result = AjaxResult.error(message, stream);
        sendMessage(JSON.toJSONString(result), sessionId);
    }

    /**
     * 返回执行成功响应
     * @param message 语音消息文本
     * @param tips 文本提示消息
     * @param sessionId socket会话id
     */
    public void sendSuccessResponse(String message, String tips, String sessionId){
        StreamSet stream = getVoiceTips(message);
        AjaxResult result = AjaxResult.success(tips, stream);
        sendMessage(JSON.toJSONString(result), sessionId);
    }
    /**
     * 发送声音提示消息
     *
     * @param message
     */
    public StreamSet getVoiceTips(String message) {
        StreamSet stream = new StreamSet();
        AjaxResult result = callPython.generateVoice(message);
        if (result.get(CODE_TAG).equals(HttpStatus.SUCCESS)) {
            String sound = (String) result.get(DATA_TAG);
            stream.setSound(sound);
        }
        return stream;
    }
}
