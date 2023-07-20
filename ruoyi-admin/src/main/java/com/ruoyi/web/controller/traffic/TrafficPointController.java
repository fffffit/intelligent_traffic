package com.ruoyi.web.controller.traffic;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.traffic.service.ITrafficPointService;
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

/**
 * @classname: TrafficPointController
 * @author: chengchangli
 * @description: 路网的点的Controller类
 * @date: 2023/7/18
 * @version: v1.0
 **/
@Api(value = "路网的点管理", tags = "路网的点管理")
@RestController
@RequestMapping("/traffic/point")
public class TrafficPointController extends BaseController {

    @Resource
    private ITrafficPointService trafficPointService;

}
