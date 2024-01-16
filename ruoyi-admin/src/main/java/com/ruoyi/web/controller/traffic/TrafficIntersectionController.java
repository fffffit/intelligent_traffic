package com.ruoyi.web.controller.traffic;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.traffic.domain.area.TrafficArea;
import com.ruoyi.traffic.domain.intersection.TrafficIntersection;
import com.ruoyi.traffic.service.area.impl.TrafficLightControlImpl;
import com.ruoyi.traffic.service.intersection.ITrafficIntersectionEvaluationDataService;
import com.ruoyi.traffic.service.intersection.ITrafficIntersectionService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @classname: TrafficIntersectionController
 * @author: ouyangdelong
 * @description: 路口的控制类
 * @date: 2023/8/7
 * @version: v1.0
 **/
@Api(value = "路口的管理", tags = "路口的管理")
@RestController
@RequestMapping("/traffic/intersection")
@Controller
public class TrafficIntersectionController extends BaseController {

    @Resource
    private ITrafficIntersectionService trafficIntersectionService;
    @Resource
    ITrafficIntersectionEvaluationDataService trafficIntersectionEvaluationDataService;

    @Resource
    TrafficLightControlImpl trafficLightControl;

    @ApiOperation("分页查询路口")
    @PostMapping("/page")
    public TableDataInfo list(@ApiParam(value = "查询的参数")@RequestBody TrafficIntersection trafficIntersection) {
        startPage();
        List<TrafficIntersection> list = trafficIntersectionService.queryList(trafficIntersection);
        return getDataTable(list);
    }

    @ApiOperation("新增路口")
    @PostMapping("/add")
    public AjaxResult add(@RequestBody TrafficIntersection trafficIntersection) {
        trafficIntersectionService.addIntersection(trafficIntersection);
        return AjaxResult.success();
    }

    @ApiOperation("编辑路口")
    @PostMapping("/update")
    public AjaxResult update(@RequestBody TrafficIntersection trafficIntersection) {
        trafficIntersectionService.updateIntersection(trafficIntersection);
        return AjaxResult.success();
    }

    @ApiOperation("删除路口")
    @PostMapping("/delete")
    public AjaxResult delete(@ApiParam(value = "数据集ID集合", required = true) @RequestBody List<Long> idList) {
        //删除该路口时把数据中和该路口有关的删除
        trafficIntersectionService.deleteIntersection(idList);
        trafficIntersectionEvaluationDataService.deleteEvaluationDataByIntersectionIds(idList);
        return AjaxResult.success();
    }

    @ApiOperation("路口的详情")
    @GetMapping("findById/{id}")
    public AjaxResult findById(@PathVariable @ApiParam(name = "id")
                               @NotNull(message = "不能为空") Long id) {
        TrafficIntersection trafficIntersection = trafficIntersectionService.queryById(id);
        return AjaxResult.success(trafficIntersection);
    }

    @ApiOperation("路口红绿灯的调控")
    @GetMapping("/TrafficLight")
    public AjaxResult TrafficLightInfo(@ApiParam(value = "四个相位车流量的集合", required = true) @RequestBody List<Integer> numList){
        TrafficLightControlImpl control = new TrafficLightControlImpl();
        return  AjaxResult.success( control.getTrafficLightInfo(numList));
    }
}
