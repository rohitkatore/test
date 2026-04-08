
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  UtensilsIcon, 
  MapPin, 
  Star, 
  Phone, 
  Mail,
  Eye,
  Wifi,
  Car,
  Utensils,
  Waves,
  Wind,
  Search
} from 'lucide-react';
import Image from 'next/image';

interface SearchResultsProps {
  results: {
    accommodations: any[];
    foodServices: any[];
  };
  isLoading: boolean;
  searchQuery: string;
}

export function SearchResults({ results, isLoading, searchQuery }: SearchResultsProps) {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'mess':
        return <Utensils className="h-4 w-4" />;
      case 'laundry':
        return <Waves className="h-4 w-4" />;
      case 'ac':
        return <Wind className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleContactOwner = (contactInfo: string) => {
    if (contactInfo.includes('@')) {
      window.open(`mailto:${contactInfo}`, '_blank');
    } else {
      window.open(`tel:${contactInfo}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-md animate-pulse">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="w-48 h-32 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalResults = results.accommodations.length + results.foodServices.length;

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {totalResults} results found
          {searchQuery && ` for "${searchQuery}"`}
        </h2>
        <div className="flex space-x-2">
          {results.accommodations.length > 0 && (
            <Badge variant="secondary">
              {results.accommodations.length} Accommodations
            </Badge>
          )}
          {results.foodServices.length > 0 && (
            <Badge variant="secondary">
              {results.foodServices.length} Food Services
            </Badge>
          )}
        </div>
      </div>

      {/* Accommodation Results */}
      {results.accommodations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Accommodation Options
          </h3>
          
          {results.accommodations.map((accommodation) => (
            <Card key={accommodation.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Image */}
                  <div className="w-full lg:w-48 h-48 lg:h-32 bg-gray-100 rounded-lg relative overflow-hidden">
                    {accommodation.photos?.[0] ? (
                      <Image
                        src={accommodation.photos[0]}
                        alt={accommodation.propertyName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {accommodation.propertyName}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {accommodation.address}
                        </p>
                      </div>
                      
                      <div className="text-right mt-2 md:mt-0">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{accommodation.monthlyRent?.toLocaleString()}/month
                        </p>
                        {accommodation.deposit && (
                          <p className="text-sm text-gray-500">
                            + ₹{accommodation.deposit?.toLocaleString()} deposit
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{accommodation.roomType}</Badge>
                      <Badge variant="outline">{accommodation.accommodationType}</Badge>
                      <Badge variant="outline">{accommodation.foodPreference} Food</Badge>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {accommodation.amenities?.slice(0, 5).map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {accommodation.amenities?.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{accommodation.amenities.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Rating and Actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        {accommodation.reviews?.length > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">
                              {calculateAverageRating(accommodation.reviews)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({accommodation.reviews.length} reviews)
                            </span>
                          </div>
                        )}
                        <Badge 
                          variant={accommodation.availability ? "secondary" : "destructive"}
                        >
                          {accommodation.availability ? "Available" : "Not Available"}
                        </Badge>
                      </div>

                      <div className="flex space-x-2 mt-2 md:mt-0">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleContactOwner(accommodation.contactInfo)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact Owner
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Food Service Results */}
      {results.foodServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UtensilsIcon className="h-5 w-5 mr-2 text-green-600" />
            Food Service Options
          </h3>
          
          {results.foodServices.map((foodService) => (
            <Card key={foodService.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Image */}
                  <div className="w-full lg:w-48 h-48 lg:h-32 bg-gray-100 rounded-lg relative overflow-hidden">
                    {foodService.photos?.[0] ? (
                      <Image
                        src={foodService.photos[0]}
                        alt={foodService.serviceName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <UtensilsIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {foodService.serviceName}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {foodService.address}
                        </p>
                      </div>
                      
                      <div className="text-right mt-2 md:mt-0">
                        <Badge variant="secondary" className="text-lg">
                          {foodService.priceRange}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{foodService.serviceType}</Badge>
                      {foodService.vegOptions && <Badge variant="outline" className="bg-green-50 text-green-700">Veg</Badge>}
                      {foodService.nonVegOptions && <Badge variant="outline" className="bg-red-50 text-red-700">Non-Veg</Badge>}
                      {foodService.deliveryAvailable && <Badge variant="outline">Delivery Available</Badge>}
                    </div>

                    {/* Cuisine Types */}
                    <div className="flex flex-wrap gap-1">
                      {foodService.cuisineType?.slice(0, 4).map((cuisine: string, index: number) => (
                        <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {cuisine}
                        </span>
                      ))}
                      {foodService.cuisineType?.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{foodService.cuisineType.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Operating Hours */}
                    {foodService.operatingHours && (
                      <p className="text-sm text-gray-600">
                        <strong>Hours:</strong> {foodService.operatingHours}
                      </p>
                    )}

                    {/* Rating and Actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        {foodService.reviews?.length > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">
                              {calculateAverageRating(foodService.reviews)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({foodService.reviews.length} reviews)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 mt-2 md:mt-0">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleContactOwner(foodService.contactInfo)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact Owner
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {totalResults === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters or search terms to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
