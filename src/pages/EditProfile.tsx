import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Save, Upload } from "lucide-react";
import ApiService from "@/services/api";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [profileData, setProfileData] = useState<any>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await ApiService.getProfile();
      if (response.success) {
        setUserType(response.user.userType);
        
        if (response.user.userType === 'freelancer') {
          setProfileData({
            name: response.user.freelancerProfile?.name || '',
            email: response.user.email || '',
            expertise: response.user.freelancerProfile?.expertise || '',
            yearsExperience: response.user.freelancerProfile?.yearsExperience || '',
            pastProjects: response.user.freelancerProfile?.pastProjects || '',
            portfolioLinks: response.user.freelancerProfile?.portfolioLinks || '',
            hourlyRate: response.user.freelancerProfile?.hourlyRate || '',
            availability: response.user.freelancerProfile?.availability || '',
          });
        } else {
          setProfileData({
            businessName: response.user.businessProfile?.businessName || '',
            email: response.user.email || '',
            industry: response.user.businessProfile?.industry || '',
            companySize: response.user.businessProfile?.companySize || '',
            goals: response.user.businessProfile?.goals || '',
            requiredSkills: response.user.businessProfile?.requiredSkills || '',
            website: response.user.businessProfile?.website || '',
            description: response.user.businessProfile?.description || '',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (userType === 'freelancer') {
        await ApiService.createFreelancerProfile(profileData);
      } else {
        await ApiService.createBusinessProfile(profileData);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement actual image upload
      toast({
        title: "Feature Coming Soon",
        description: "Profile picture upload will be available soon",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              {userType === 'freelancer' ? (
                <User className="h-10 w-10 text-primary" />
              ) : (
                <Building2 className="h-10 w-10 text-primary" />
              )}
              <h1 className="text-4xl font-bold text-foreground">
                Edit Profile
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Update your {userType === 'freelancer' ? 'freelancer' : 'business'} information
            </p>
          </div>

          <Card className="p-8 animate-slide-up">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Picture Upload */}
              <div>
                <Label className="text-foreground">Profile Picture</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    {userType === 'freelancer' ? (
                      <User className="h-10 w-10 text-primary" />
                    ) : (
                      <Building2 className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('profile-picture')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>

              {userType === 'freelancer' ? (
                // Freelancer Fields
                <>
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="mt-2"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="mt-2 bg-muted"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="expertise" className="text-foreground">
                      Expertise & Skills <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="expertise"
                      value={profileData.expertise}
                      onChange={(e) => setProfileData({ ...profileData, expertise: e.target.value })}
                      placeholder="e.g., AI automation, workflow design"
                      className="mt-2"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="yearsExperience" className="text-foreground">
                      Years of Experience <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profileData.yearsExperience}
                      onValueChange={(value) => setProfileData({ ...profileData, yearsExperience: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">Less than 1 year</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate" className="text-foreground">
                      Hourly Rate (USD)
                    </Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={profileData.hourlyRate}
                      onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                      placeholder="50"
                      className="mt-2"
                      min="0"
                      step="0.01"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability" className="text-foreground">
                      Availability
                    </Label>
                    <Select
                      value={profileData.availability}
                      onValueChange={(value) => setProfileData({ ...profileData, availability: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time (40+ hrs/week)</SelectItem>
                        <SelectItem value="part-time">Part-time (20-40 hrs/week)</SelectItem>
                        <SelectItem value="contract">Contract basis</SelectItem>
                        <SelectItem value="hourly">Hourly projects</SelectItem>
                        <SelectItem value="not-available">Not currently available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pastProjects" className="text-foreground">
                      Past Projects
                    </Label>
                    <Textarea
                      id="pastProjects"
                      value={profileData.pastProjects}
                      onChange={(e) => setProfileData({ ...profileData, pastProjects: e.target.value })}
                      placeholder="Describe your notable past projects..."
                      className="mt-2 min-h-[120px]"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="portfolioLinks" className="text-foreground">
                      Portfolio Links
                    </Label>
                    <Input
                      id="portfolioLinks"
                      value={profileData.portfolioLinks}
                      onChange={(e) => setProfileData({ ...profileData, portfolioLinks: e.target.value })}
                      placeholder="https://portfolio.com, https://github.com/username"
                      className="mt-2"
                      disabled={saving}
                    />
                  </div>
                </>
              ) : (
                // Business Fields
                <>
                  <div>
                    <Label htmlFor="businessName" className="text-foreground">
                      Business Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      value={profileData.businessName}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                      placeholder="Enter your business name"
                      className="mt-2"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="mt-2 bg-muted"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="industry" className="text-foreground">
                      Industry <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={profileData.industry}
                      onValueChange={(value) => setProfileData({ ...profileData, industry: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="companySize" className="text-foreground">
                      Company Size
                    </Label>
                    <Select
                      value={profileData.companySize}
                      onValueChange={(value) => setProfileData({ ...profileData, companySize: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="goals" className="text-foreground">
                      Goals & Objectives <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="goals"
                      value={profileData.goals}
                      onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                      placeholder="What are your business goals?"
                      className="mt-2 min-h-[100px]"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="requiredSkills" className="text-foreground">
                      Required Skills
                    </Label>
                    <Input
                      id="requiredSkills"
                      value={profileData.requiredSkills}
                      onChange={(e) => setProfileData({ ...profileData, requiredSkills: e.target.value })}
                      placeholder="e.g., AI integration, workflow automation"
                      className="mt-2"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-foreground">
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="mt-2"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-foreground">
                      Company Description
                    </Label>
                    <Textarea
                      id="description"
                      value={profileData.description}
                      onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                      placeholder="Tell us about your company..."
                      className="mt-2 min-h-[120px]"
                      disabled={saving}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
