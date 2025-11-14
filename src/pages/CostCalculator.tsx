import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, DollarSign, TrendingUp, Clock, Users } from "lucide-react";

const CostCalculator = () => {
  const [projectData, setProjectData] = useState({
    projectType: "",
    hourlyRate: "",
    estimatedHours: "",
    numberOfFreelancers: "1",
    additionalCosts: "",
  });

  const [results, setResults] = useState({
    totalCost: 0,
    weeklyROI: 0,
    monthlyROI: 0,
    yearlyROI: 0,
    breakEvenWeeks: 0,
  });

  const [showResults, setShowResults] = useState(false);

  const calculateCosts = () => {
    const hourlyRate = parseFloat(projectData.hourlyRate) || 0;
    const estimatedHours = parseFloat(projectData.estimatedHours) || 0;
    const numberOfFreelancers = parseFloat(projectData.numberOfFreelancers) || 1;
    const additionalCosts = parseFloat(projectData.additionalCosts) || 0;

    const laborCost = hourlyRate * estimatedHours * numberOfFreelancers;
    const totalCost = laborCost + additionalCosts;

    // Estimated time savings and ROI calculations
    // Assume automation saves 10 hours per week at $50/hour average
    const weeklySavings = 10 * 50;
    const monthlySavings = weeklySavings * 4;
    const yearlySavings = weeklySavings * 52;

    const weeklyROI = ((weeklySavings - totalCost / 52) / totalCost) * 100;
    const monthlyROI = ((monthlySavings - totalCost / 12) / totalCost) * 100;
    const yearlyROI = ((yearlySavings - totalCost) / totalCost) * 100;
    const breakEvenWeeks = totalCost / weeklySavings;

    setResults({
      totalCost,
      weeklyROI: isFinite(weeklyROI) ? weeklyROI : 0,
      monthlyROI: isFinite(monthlyROI) ? monthlyROI : 0,
      yearlyROI: isFinite(yearlyROI) ? yearlyROI : 0,
      breakEvenWeeks: isFinite(breakEvenWeeks) ? breakEvenWeeks : 0,
    });

    setShowResults(true);
  };

  const resetCalculator = () => {
    setProjectData({
      projectType: "",
      hourlyRate: "",
      estimatedHours: "",
      numberOfFreelancers: "1",
      additionalCosts: "",
    });
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Cost Calculator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Calculate project costs and ROI for your automation projects
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="p-8 animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Project Details</h2>

              <div className="space-y-6">
                {/* Project Type */}
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select
                    value={projectData.projectType}
                    onValueChange={(value) =>
                      setProjectData({ ...projectData, projectType: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-automation">AI Automation</SelectItem>
                      <SelectItem value="workflow-design">Workflow Design</SelectItem>
                      <SelectItem value="api-integration">API Integration</SelectItem>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="data-analysis">Data Analysis</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hourly Rate */}
                <div>
                  <Label htmlFor="hourlyRate">Freelancer Hourly Rate ($)</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={projectData.hourlyRate}
                      onChange={(e) =>
                        setProjectData({ ...projectData, hourlyRate: e.target.value })
                      }
                      placeholder="50"
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Estimated Hours */}
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <div className="relative mt-2">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={projectData.estimatedHours}
                      onChange={(e) =>
                        setProjectData({ ...projectData, estimatedHours: e.target.value })
                      }
                      placeholder="40"
                      className="pl-10"
                      min="0"
                    />
                  </div>
                </div>

                {/* Number of Freelancers */}
                <div>
                  <Label htmlFor="numberOfFreelancers">Number of Freelancers</Label>
                  <div className="relative mt-2">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="numberOfFreelancers"
                      type="number"
                      value={projectData.numberOfFreelancers}
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          numberOfFreelancers: e.target.value,
                        })
                      }
                      placeholder="1"
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>

                {/* Additional Costs */}
                <div>
                  <Label htmlFor="additionalCosts">
                    Additional Costs (tools, licenses, etc.)
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="additionalCosts"
                      type="number"
                      value={projectData.additionalCosts}
                      onChange={(e) =>
                        setProjectData({ ...projectData, additionalCosts: e.target.value })
                      }
                      placeholder="0"
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={calculateCosts} className="flex-1">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate
                  </Button>
                  <Button onClick={resetCalculator} variant="outline" className="flex-1">
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              <Card className="p-8 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6">Cost Breakdown</h2>

                {showResults ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Total Project Cost</span>
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-3xl font-bold text-primary">
                        ${results.totalCost.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Cost Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Labor Cost:</span>
                          <span className="font-medium">
                            $
                            {(
                              parseFloat(projectData.hourlyRate || "0") *
                              parseFloat(projectData.estimatedHours || "0") *
                              parseFloat(projectData.numberOfFreelancers || "1")
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Additional Costs:</span>
                          <span className="font-medium">
                            ${parseFloat(projectData.additionalCosts || "0").toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span>${results.totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Enter project details to calculate costs</p>
                  </div>
                )}
              </Card>

              <Card className="p-8 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Estimated ROI
                </h2>

                {showResults ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Break-even Point
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {results.breakEvenWeeks.toFixed(1)} weeks
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Weekly ROI</span>
                        <span className="font-bold text-green-600">
                          {results.weeklyROI.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Monthly ROI</span>
                        <span className="font-bold text-green-600">
                          {results.monthlyROI.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Yearly ROI</span>
                        <span className="font-bold text-green-600">
                          {results.yearlyROI.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      * ROI estimates based on average time savings of 10 hours per week at
                      $50/hour. Actual results may vary.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>ROI calculations will appear here</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CostCalculator;
